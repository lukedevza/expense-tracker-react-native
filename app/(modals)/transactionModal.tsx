import BackButton from "@/components/BackButton";
import Button from "@/components/Button";
import Header from "@/components/Header";
import ImageUpload from "@/components/imageUpload";
import Input from "@/components/Input";
import ModalWrapper from "@/components/ModalWrapper";
import Typo from "@/components/Typo";
import { expenseCategories, transactionTypes } from "@/constants/data";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import { useAuth } from "@/context/authContext";
import useFetchData from "@/hooks/useFetchData";
import { deleteWallet } from "@/services/walletService";
import { TransactionType, WalletType } from "@/types";
import { scale, verticalScale } from "@/utils/styling";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { orderBy, where } from "firebase/firestore";
import * as Icons from "phosphor-react-native";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";

const TransactionModal = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [transaction, setTransaction] = useState<TransactionType>({
    type: "expense",
    amount: 0,
    description: "",
    category: "",
    date: new Date(),
    walletId: "",
    image: null,
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  const {
    data: wallets,
    isLoading: walletIsLoading,
    error: walletError,
  } = useFetchData<WalletType>("wallets", [
    where("uid", "==", user?.uid),
    orderBy("created", "desc"),
  ]);
  const oldTransaction: { name: string; image: string; id: string } = useLocalSearchParams();

  const onDateChange = (event: any, selectedDate: any) => {
    const currentDate = selectedDate || transaction.date;
    setTransaction({ ...transaction, date: currentDate });
    setShowDatePicker(Platform.OS === "ios" ? true : false);
  };

  // useEffect(() => {
  //   if (transaction?.id) {
  //     setTransaction({
  //       name: oldTransaction.name,
  //       image: oldTransaction.image,
  //     });
  //   }
  // }, []);

  const onSubmit = async () => {
    const { type, amount, description, category, date, walletId, image } = transaction;
    if (!walletId || !date || !amount || (type === "expense" && !category)) {
      setIsLoading(false);
      Alert.alert("Transaction", "Please fill all the fields");
      return;
    }
    let transactionData: TransactionType = {
      type,
      amount,
      description,
      category,
      date,
      walletId,
      image,
      uid: user?.uid,
    };
  };

  const onDelete = async () => {
    console.log("deleting");
    if (!oldTransaction?.id) return;
    setIsLoading(true);
    const res = await deleteWallet(oldTransaction?.id);
    setIsLoading(false);
    if (res.success) {
      router.back();
    } else {
      Alert.alert("Wallet", res.msg);
    }
  };

  const showDeleteAlert = () => {
    Alert.alert(
      "Confirm",
      "Are you sure you want to delete this wallet? \nThis action will remove all the transactions related to this wallet.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => onDelete() },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.neutral900 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 50 : 80}
      enabled={true}
    >
      <ModalWrapper>
        <View style={styles.container}>
          <Header
            title={oldTransaction?.id ? "Update Transaction" : "New Transaction"}
            leftIcon={<BackButton />}
            style={{ marginBottom: spacingY._10 }}
          />
          <ScrollView
            style={styles.form}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* TRANSACTION TYPE */}
            <View style={styles.inputContainer}>
              <Typo
                color={colors.neutral200}
                size={16}
              >
                Type
              </Typo>
              {/* dropdown */}
              <Dropdown
                style={styles.dropdownContainer}
                placeholderStyle={styles.dropdownPlaceholder}
                activeColor={colors.neutral700}
                selectedTextStyle={styles.dropdownSelectedText}
                iconStyle={styles.dropdownIcon}
                itemTextStyle={styles.dropdownItemText}
                itemContainerStyle={styles.dropdownItemContainer}
                containerStyle={styles.dropdownListContainer}
                data={transactionTypes}
                maxHeight={300}
                labelField="label"
                valueField="value"
                value={transaction.type}
                onChange={(item) => {
                  setTransaction({ ...transaction, type: item.value });
                }}
              />
            </View>
            {/* SELECT WALLET */}
            <View style={styles.inputContainer}>
              <Typo
                color={colors.neutral200}
                size={16}
              >
                Wallet
              </Typo>
              {/* dropdown */}
              <Dropdown
                style={styles.dropdownContainer}
                placeholderStyle={styles.dropdownPlaceholder}
                activeColor={colors.neutral700}
                selectedTextStyle={styles.dropdownSelectedText}
                iconStyle={styles.dropdownIcon}
                itemTextStyle={styles.dropdownItemText}
                itemContainerStyle={styles.dropdownItemContainer}
                containerStyle={styles.dropdownListContainer}
                data={wallets.map((wallet) => ({
                  label: `${wallet.name} (${wallet.amount})`,
                  value: wallet.id,
                }))}
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder="Select Wallet"
                value={transaction.walletId}
                onChange={(item) => {
                  setTransaction({ ...transaction, walletId: item.value || "" });
                }}
              />
            </View>
            {/* EXPENSE TYPE */}
            {transaction.type === "expense" && (
              <View style={styles.inputContainer}>
                <Typo
                  color={colors.neutral200}
                  size={16}
                >
                  Expense Category
                </Typo>
                {/* dropdown */}
                <Dropdown
                  style={styles.dropdownContainer}
                  placeholderStyle={styles.dropdownPlaceholder}
                  activeColor={colors.neutral700}
                  selectedTextStyle={styles.dropdownSelectedText}
                  iconStyle={styles.dropdownIcon}
                  itemTextStyle={styles.dropdownItemText}
                  itemContainerStyle={styles.dropdownItemContainer}
                  containerStyle={styles.dropdownListContainer}
                  data={Object.values(expenseCategories)}
                  maxHeight={300}
                  labelField="label"
                  valueField="value"
                  placeholder="Select Category"
                  value={transaction.category}
                  onChange={(item) => {
                    setTransaction({ ...transaction, category: item.value || "" });
                  }}
                />
              </View>
            )}

            {/* DATE PICKER */}
            <View style={styles.inputContainer}>
              <Typo
                color={colors.neutral200}
                size={16}
              >
                Date
              </Typo>
              {!showDatePicker && (
                <Pressable
                  style={styles.dateInput}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Typo size={14}>{(transaction.date as Date).toLocaleDateString()}</Typo>
                </Pressable>
              )}
              {showDatePicker && (
                <View style={Platform.OS === "ios" && styles.iosDatePicker}>
                  <DateTimePicker
                    themeVariant="dark"
                    value={transaction.date as Date}
                    textColor={colors.white}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={onDateChange}
                  />
                  {Platform.OS === "ios" && (
                    <TouchableOpacity
                      style={styles.datePickerButton}
                      onPress={() => setShowDatePicker(false)}
                    >
                      <Typo
                        size={15}
                        fontWeight={"500"}
                      >
                        Ok
                      </Typo>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>

            {/* AMOUNT */}
            <View style={styles.inputContainer}>
              <Typo
                color={colors.neutral200}
                size={16}
              >
                Amount
              </Typo>
              <Input
                value={transaction.amount?.toString()}
                keyboardType="numeric"
                onChangeText={(value) =>
                  setTransaction({ ...transaction, amount: Number(value.replace(/[^0-9]/g, "")) })
                }
              />
            </View>

            {/* DESCRIPTION */}
            <View style={styles.inputContainer}>
              <View style={styles.flexRow}>
                <Typo
                  color={colors.neutral200}
                  size={16}
                >
                  Description
                </Typo>
                <Typo
                  color={colors.neutral500}
                  size={14}
                >
                  (optional)
                </Typo>
              </View>
              <Input
                value={transaction.description}
                multiline
                containerStyle={{
                  flexDirection: "row",
                  height: verticalScale(100),
                  alignItems: "flex-start",
                  paddingVertical: 15,
                }}
                onChangeText={(value) => setTransaction({ ...transaction, description: value })}
              />
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.flexRow}>
                <Typo
                  color={colors.neutral200}
                  size={16}
                >
                  Receipt
                </Typo>
                <Typo
                  color={colors.neutral500}
                  size={14}
                >
                  (optional)
                </Typo>
              </View>
              <ImageUpload
                placeholder="Upload image"
                file={transaction.image}
                onSelect={(file) => setTransaction({ ...transaction, image: file })}
                onClear={() => setTransaction({ ...transaction, image: null })}
              />
            </View>
          </ScrollView>
        </View>
        <View style={styles.footer}>
          {oldTransaction?.id && !isLoading && (
            <Button
              style={{ backgroundColor: colors.rose, paddingHorizontal: spacingX._15 }}
              onPress={showDeleteAlert}
            >
              <Icons.TrashIcon
                color={colors.white}
                size={verticalScale(24)}
                weight="bold"
              />
            </Button>
          )}
          <Button
            onPress={onSubmit}
            style={{ flex: 1 }}
            loading={isLoading}
          >
            <Typo
              color={colors.black}
              fontWeight={"700"}
            >
              {oldTransaction?.id ? "Update" : "Submit"}
            </Typo>
          </Button>
        </View>
      </ModalWrapper>
    </KeyboardAvoidingView>
  );
};

export default TransactionModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacingY._20,
  },
  form: {
    paddingVertical: spacingY._15,
    paddingBottom: spacingY._40,
  },
  footer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: spacingX._20,
    gap: scale(12),
    paddingTop: spacingY._15,
    borderTopColor: colors.neutral700,
    marginBottom: spacingY._5,
    borderTopWidth: 1,
  },
  inputContainer: {
    gap: spacingY._10,
    marginVertical: spacingY._10,
  },
  iosDropDown: {
    flexDirection: "row",
    height: verticalScale(54),
    alignItems: "center",
    justifyContent: "center",
    fontSize: verticalScale(14),
    borderWidth: 1,
    color: colors.white,
    borderColor: colors.neutral300,
    borderRadius: radius._17,
    borderCurve: "continuous",
    paddingHorizontal: spacingX._15,
  },
  androidDropDown: {
    height: verticalScale(54),
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    fontSize: verticalScale(14),
    color: colors.white,
    borderColor: colors.neutral300,
    borderRadius: radius._17,
    borderCurve: "continuous",
  },
  flexRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._5,
  },
  dateInput: {
    flexDirection: "row",
    height: verticalScale(54),
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.neutral300,
    borderRadius: radius._17,
    borderCurve: "continuous",
    paddingHorizontal: spacingX._15,
  },
  iosDatePicker: {
    // backgroundColor: colors.rose,
  },
  datePickerButton: {
    backgroundColor: colors.neutral700,
    alignSelf: "flex-end",
    padding: spacingY._7,
    marginRight: spacingX._7,
    paddingHorizontal: spacingY._15,
    borderRadius: radius._10,
  },
  dropdownContainer: {
    height: verticalScale(54),
    borderWidth: 1,
    borderColor: colors.neutral300,
    paddingHorizontal: spacingX._15,
    borderRadius: radius._15,
    borderCurve: "continuous",
  },
  dropdownItemText: {
    color: colors.white,
  },
  dropdownSelectedText: {
    color: colors.white,
    fontSize: verticalScale(14),
  },
  dropdownListContainer: {
    backgroundColor: colors.neutral900,
    borderRadius: radius._15,
    borderCurve: "continuous",
    paddingVertical: spacingY._7,
    top: -2,
    borderColor: colors.neutral500,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 5,
  },
  dropdownPlaceholder: {
    color: colors.white,
  },
  dropdownItemContainer: {
    borderRadius: radius._15,
    marginHorizontal: spacingX._7,
  },
  dropdownIcon: {
    height: verticalScale(30),
    tintColor: colors.neutral300,
  },
});
