import { firestore } from "@/config/firebase";
import { ResponseType, TransactionType, WalletType } from "@/types";
import { collection, deleteDoc, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { uploadFileToCloudinary } from "./imageService";
import { createOrUpdateWallet } from "./walletService";

export const createOrUpdateTransaction = async (
  transactionData: Partial<TransactionType>
): Promise<ResponseType> => {
  try {
    const { id, type, walletId, image, amount } = transactionData;
    if (!amount || amount <= 0 || !walletId || !type) {
      return { success: false, msg: "Invalid transaction data!" };
    }

    if (id) {
      // upate transaction
      const oldTransaciotnSnapshot = await getDoc(doc(firestore, "transactions", id));
      const oldTransaction = oldTransaciotnSnapshot.data() as TransactionType;
      const shouldRevertOriginal =
        oldTransaction.type !== type ||
        oldTransaction.amount !== amount ||
        oldTransaction.id !== walletId;
      if (shouldRevertOriginal) {
        let res = await revertAndUpdateWallets(oldTransaction, Number(amount), type, walletId);
        if (!res.success) return res;
      }
    } else {
      // update wallet
      let res = await updateWalletForNewTransaction(walletId!, Number(amount!), type);
      if (!res.success) return res;
    }
    if (image) {
      const imageUploadRes = await uploadFileToCloudinary(image, "transactions");
      if (!imageUploadRes.success) {
        return { success: false, msg: imageUploadRes.msg || "Failed to upload recepit" };
      }
      transactionData.image = imageUploadRes.data;
    }

    const transactionRef = id
      ? doc(firestore, "transactions", id)
      : doc(collection(firestore, "transactions"));

    await setDoc(transactionRef, transactionData, { merge: true });

    return { success: true, data: { ...transactionData, id: transactionRef.id } };
  } catch (error: any) {
    console.error("Error creating or updating transaction:", error);
    return { success: false, msg: error.message };
  }
};

const updateWalletForNewTransaction = async (
  walletId: string,
  amount: number,
  type: string
): Promise<ResponseType> => {
  try {
    const walletRef = doc(firestore, "wallets", walletId);
    const walletSnapshot = await getDoc(walletRef);
    if (!walletSnapshot.exists()) {
      console.error("Error updating wallet for new transaction:");
      return { success: false, msg: "Wallet not found" };
    }

    const walletData = walletSnapshot.data() as WalletType;
    if (type === "expense" && walletData.amount! - amount < 0) {
      return { success: false, msg: "Selected wallet doesn't have enough funds." };
    }

    const updateType = type === "income" ? "totalIncome" : "totalExpenses";
    const updatedWalletAmount =
      type === "income" ? Number(walletData.amount) + amount : Number(walletData.amount) - amount;
    const updatedTotals =
      type === "income"
        ? Number(walletData.totalIncome) + amount
        : Number(walletData.totalExpenses) + amount;
    await updateDoc(walletRef, {
      amount: updatedWalletAmount,
      [updateType]: updatedTotals,
    });
    return { success: true };
  } catch (error: any) {
    console.error("Error updating wallet for new transaction:", error);
    return { success: false, msg: error.message };
  }
};

const revertAndUpdateWallets = async (
  oldTransaction: TransactionType,
  newTransactionAmount: number,
  newTransactionType: string,
  newWalletId: string
): Promise<ResponseType> => {
  try {
    const originalWalletSnapshot = await getDoc(doc(firestore, "wallets", oldTransaction.walletId));

    const originalWallet = originalWalletSnapshot.data() as WalletType;

    let newWalletSnapshot = await getDoc(doc(firestore, "wallets", newWalletId));
    let newWallet = newWalletSnapshot.data() as WalletType;

    const revertType = oldTransaction.type === "income" ? "totalIncome" : "totalExpenses";

    const revertIncomeExpense: number =
      oldTransaction.type === "income"
        ? -Number(oldTransaction.amount)
        : Number(oldTransaction.amount);

    const revertedWalletAmount = Number(originalWallet.amount) + revertIncomeExpense;

    const revertedIncomeExpenseAmount =
      Number(originalWallet[revertType]) - Number(oldTransaction.amount);

    // if user tries to convert income to expense on the same wallet
    // or if user tries to increase expense amount with funds
    if (newTransactionType === "expense") {
      if (oldTransaction.walletId === newWalletId && revertedWalletAmount < newTransactionAmount) {
        return { success: false, msg: "Selected wallet has insufficient funds" };
      }

      // user tries to add expense from a new wallet but the wall has insuffiecient funds
      if (newWallet.amount! < newTransactionAmount) {
        return { success: false, msg: "Selected wallet has insufficient funds" };
      }
    }

    await createOrUpdateWallet({
      id: oldTransaction.walletId,
      amount: revertedWalletAmount,
      [revertType]: revertedIncomeExpenseAmount,
    });

    // REVERT COMPLETED

    /////////////////////////////////////////////////////////////////////

    // refetch the newWallet because we may have just updated it

    newWalletSnapshot = await getDoc(doc(firestore, "wallets", newWalletId));
    newWallet = newWalletSnapshot.data() as WalletType;

    const updateType = newTransactionType === "income" ? "totalIncome" : "totalExpenses";

    const updatedTransactionAmount: number =
      newTransactionType === "income"
        ? Number(newTransactionAmount)
        : -Number(newTransactionAmount);

    const newWalletAmount = Number(newWallet.amount) + updatedTransactionAmount;

    const newIcomeExpenseAmount = Number(newWallet[updateType]! + Number(newTransactionAmount));

    await createOrUpdateWallet({
      id: newWallet.id,
      amount: newWalletAmount,
      [updateType]: newIcomeExpenseAmount,
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error updating wallet for new transaction:", error);
    return { success: false, msg: error.message };
  }
};

export const deleteTransaction = async (
  transactionId: string,
  walletId: string
): Promise<ResponseType> => {
  try {
    const transactionRef = doc(firestore, "transactions", transactionId);
    const transactionSnapshot = await getDoc(transactionRef);
    if (!transactionSnapshot.exists()) {
      return { success: false, msg: "Transaction not found" };
    }
    const transactionData = transactionSnapshot.data() as TransactionType;

    const transactionType = transactionData?.type;
    const transactionAmount = transactionData?.amount;

    // fetch wallet to update amount, totalIncome or totalExpenses

    const walletSnapshot = await getDoc(doc(firestore, "wallets", walletId));
    const walletData = walletSnapshot.data() as WalletType;

    // check fields to be updated based on transaction type
    const updateType = transactionType === "income" ? "totalIncome" : "totalExpenses";
    const newWalletAmount =
      walletData?.amount! - (transactionType === "income" ? transactionAmount : -transactionAmount);

    const newIncomeExpenseAmount = walletData[updateType]! - transactionAmount;

    if (transactionType === "income" && newWalletAmount < 0) {
      return { success: false, msg: "You cannot delete this transaction" };
    }

    await createOrUpdateWallet({
      id: walletId,
      amount: newWalletAmount,
      [updateType]: newIncomeExpenseAmount,
    });

    await deleteDoc(transactionRef);

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting transaction:", error);
    return { success: false, msg: error.msg };
  }
};
