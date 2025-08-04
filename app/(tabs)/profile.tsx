import Header from "@/components/Header";
import ScreenWrapper from "@/components/ScreenWrapper";
import Typo from "@/components/Typo";
import { auth } from "@/config/firebase";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import { useAuth } from "@/context/authContext";
import { getProfileImage } from "@/services/imageService";
import { accountOptionType } from "@/types";
import { verticalScale } from "@/utils/styling";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import * as Icons from "phosphor-react-native";
import React from "react";
import { Alert, StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

const Profile = () => {
  const { user } = useAuth();
  const router = useRouter();
  const accountOptions: accountOptionType[] = [
    {
      title: "Edit profile",
      icon: (
        <Icons.UserIcon
          size={26}
          color={colors.white}
          weight="fill"
        />
      ),
      routeName: "/(modals)/profileModal",
      bgColor: "#6366F1",
    },
    {
      title: "Settings",
      icon: (
        <Icons.GearSixIcon
          size={26}
          color={colors.white}
          weight="fill"
        />
      ),
      // routeName: "/(modals)/profileModal",
      bgColor: "#059669",
    },
    {
      title: "Privacy Policy",
      icon: (
        <Icons.LockIcon
          size={26}
          color={colors.white}
          weight="fill"
        />
      ),
      // routeName: "/(modals)/profileModal",
      bgColor: colors.neutral600,
    },
    {
      title: "Logout",
      icon: (
        <Icons.PowerIcon
          size={26}
          color={colors.white}
          weight="fill"
        />
      ),
      // routeName: "/(modals)/profileModal",
      bgColor: "#E11D48",
    },
  ];

  const handleLogout = async () => {
    await signOut(auth);
  };

  const showLogoutAlert = () => {
    Alert.alert("Confirm", "Are you sure you want to logout?", [
      {
        text: "Cancel",

        style: "cancel",
      },
      {
        text: "Logout",
        onPress: () => handleLogout(),
        style: "destructive",
      },
    ]);
  };

  const handlePress = (item: accountOptionType) => {
    if (item.title === "Logout") {
      showLogoutAlert();
    }

    if (item.routeName) router.push(item.routeName);
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Header
          title="Profile"
          style={{ marginVertical: spacingY._10 }}
        />
        {/* User info */}
        <View style={styles.userInfo}>
          {/* user avatar */}
          <View>
            <Image
              source={getProfileImage(user?.image)}
              style={styles.avatar}
              contentFit="cover"
              transition={100}
            />
          </View>
          {/* name & email */}
          <View style={styles.nameContainer}>
            <Typo
              size={24}
              fontWeight={"600"}
              color={colors.neutral100}
            >
              {user?.name}
            </Typo>
            <Typo
              size={15}
              color={colors.neutral400}
            >
              {user?.email}
            </Typo>
          </View>
        </View>

        {/* Account Options */}
        <View style={styles.accountOptions}>
          {accountOptions.map((item, index) => {
            return (
              <Animated.View
                entering={FadeInDown.delay(index * 50)
                  .springify()
                  .damping(14)}
                key={index.toString()}
                style={styles.listItem}
              >
                <TouchableOpacity
                  style={styles.flexRow}
                  onPress={() => handlePress(item)}
                >
                  <View style={[styles.listIcon, { backgroundColor: item?.bgColor }]}>
                    {item.icon && item.icon}
                  </View>
                  <Typo
                    size={16}
                    style={{ flex: 1 }}
                    fontWeight={"500"}
                  >
                    {item.title}
                  </Typo>
                  <Icons.CaretRightIcon
                    size={verticalScale(20)}
                    weight="bold"
                    color={colors.white}
                  />
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacingX._20,
  },
  userInfo: {
    marginTop: verticalScale(30),
    alignItems: "center",
    gap: spacingY._15,
  },
  avatarContainer: {
    position: "relative",
    alignSelf: "center",
  },
  avatar: {
    alignSelf: "center",
    backgroundColor: colors.neutral300,
    height: verticalScale(135),
    width: verticalScale(135),
    borderRadius: 200,
  },
  editIcon: {
    position: "absolute",
    bottom: 5,
    right: 8,
    borderRadius: 50,
    backgroundColor: colors.neutral100,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
    padding: 5,
  },
  nameContainer: {
    gap: verticalScale(4),
    alignItems: "center",
  },
  listIcon: {
    height: verticalScale(44),
    width: verticalScale(44),
    backgroundColor: colors.neutral500,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius._15,
    borderCurve: "continuous",
  },
  listItem: {
    marginBottom: verticalScale(17),
  },
  accountOptions: {
    marginTop: spacingY._15,
  },
  flexRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingY._10,
  },
});
