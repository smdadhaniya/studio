"use client";

import React from "react";
import dynamic from "next/dynamic";

const AdminPage = dynamic(() => import("../../components/AdminPage"), {
  ssr: false,
});

const page = () => {
  return <AdminPage />;
};

export default page;
