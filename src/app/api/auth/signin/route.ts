import { Firebase } from "@/lib/firebase-error-handler";
import { signInWithEmailAndPassword } from "firebase/auth";
import {  getDoc, doc } from "firebase/firestore";
import { NextApiRequest, NextApiResponse } from "next";
import { HabitForgeAuth, HabitForgeFirestore } from "../../../../../firebase/firebase.config";

const signInHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Missing required fields: email and password.",
      });
    }

    const { user } = await signInWithEmailAndPassword(HabitForgeAuth, email, password);
    const userDocRef = doc(HabitForgeFirestore, "users", user.uid);
    const userSnapshot = await getDoc(userDocRef);

    if (!userSnapshot.exists()) {
      return res.status(404).json({ message: "User record not found in Firestore." });
    }

    const accessToken = await user.getIdToken();
    const refreshToken = user.refreshToken;

    return res.status(200).json({
      success: true,
      message: "Successfully signed in",
      data: {
        userInfo: userSnapshot.data(),
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    Firebase.handleFirebaseError(error);
  }
};

export default signInHandler;
