import BackButton from "@/components/BackButton";
import Header from "@/components/Header";
import Input from "@/components/Input";
import ModalWrapper from "@/components/ModalWrapper";
import TransactionList from "@/components/TransactionList";
import { colors, spacingY } from "@/constants/theme";
import { useAuth } from "@/context/authContext";
import useFetchData from "@/hooks/useFetchData";
import { TransactionType } from "@/types";
import { useRouter } from "expo-router";
import { orderBy, where } from "firebase/firestore";
import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
const SearchModal = () => {
  const router = useRouter();
  const { user, updateUserData } = useAuth();
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const constraints = [where("uid", "==", user?.uid), orderBy("date", "desc")];

  const {
    data: allTransactions,
    isLoading: allTransactionsIsLoading,
    error: allTransactionsError,
  } = useFetchData<TransactionType>("transactions", constraints);

  const filteredTransactions = allTransactions.filter((item) => {
    if (search.length > 1) {
      if (
        item.category?.toLocaleLowerCase()?.includes(search?.toLowerCase()) ||
        item.type?.toLocaleLowerCase()?.includes(search?.toLowerCase()) ||
        item.description?.toLocaleLowerCase()?.includes(search?.toLowerCase())
      ) {
        return true;
      }
      return false;
    }
    return true;
  });

  return (
    <ModalWrapper style={{ backgroundColor: colors.neutral900 }}>
      <View style={styles.container}>
        <Header
          title={"Search"}
          leftIcon={<BackButton />}
          style={{ marginBottom: spacingY._10 }}
        />
        <ScrollView
          style={styles.form}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.inputContainer}>
            <Input
              containerStyle={{ backgroundColor: colors.neutral800 }}
              placeholderTextColor={colors.neutral400}
              placeholder="Search for a transaction..."
              value={search}
              onChangeText={(val) => {
                setSearch(val);
              }}
            />
          </View>

          <View>
            <TransactionList
              loading={allTransactionsIsLoading}
              data={filteredTransactions}
              emptyListMessage="No transactions match your search keywords"
            />
          </View>
        </ScrollView>
      </View>
    </ModalWrapper>
  );
};

export default SearchModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: spacingY._20,
  },

  form: {
    gap: spacingY._40,
    marginTop: spacingY._5,
  },

  inputContainer: {
    gap: spacingY._10,
    marginTop: spacingY._20,
    marginBottom: spacingY._20,
  },
});
