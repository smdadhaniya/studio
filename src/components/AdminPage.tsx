// src/app/admin/page.tsx
"use client"; // For using alerts and potential future client-side interactions

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  MoreHorizontal,
  PlusCircle,
  Edit3,
  Trash2,
  ShieldCheck,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import { loadState } from "@/lib/localStorageUtils";
import { useRouter } from "next/navigation";

const mockSubscribers = [
  {
    id: "usr_1a2b3c",
    name: "Alice Wonderland",
    email: "alice@example.com",
    plan: "Yearly Premium",
    startDate: "2023-01-15",
    status: "Active",
  },
  {
    id: "usr_4d5e6f",
    name: "Bob The Builder",
    email: "bob@example.com",
    plan: "Monthly Premium",
    startDate: "2023-06-01",
    status: "Active",
  },
  {
    id: "usr_7g8h9i",
    name: "Charlie Brown",
    email: "charlie@example.com",
    plan: "Monthly Premium",
    startDate: "2024-02-10",
    status: "Cancelled",
  },
  {
    id: "usr_j0k1l2",
    name: "Diana Prince",
    email: "diana@example.com",
    plan: "Yearly Premium",
    startDate: "2023-11-20",
    status: "Active",
  },
  {
    id: "usr_m3n4o5",
    name: "Edward Scissorhands",
    email: "edward@example.com",
    plan: "Free Tier",
    startDate: "2024-03-01",
    status: "Active",
  },
];

export default function AdminPage() {
  const router = useRouter();
  const [subscribers, setSubscribers] = useState<any>([]);
  const [isUserRemoving, setIsUserRemoving] = useState<boolean>(false);

  const fetchUsers = async () => {
    const res = await axiosInstance.get("/api/admin-panel/users");
    setSubscribers(res.data.users);
  };

  useEffect(() => {
    const accessToken = loadState("admin_accessToken", "");
    if (accessToken) {
      fetchUsers();
    } else {
      router.replace("/admin/login");
    }
  }, []);

  const handleEditUser = (userId: string) => {
    toast({
      title: "Simulated Action",
      description: `Edit action for user ${userId} would be here.`,
    });
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      setIsUserRemoving(true);
      if (
        window.confirm(
          `Are you sure you want to delete user ${userId}? This is a simulated action.`
        )
      ) {
        const response = await axiosInstance.delete(
          "/api/admin-panel/users/delete-user",
          {
            params: { userId },
          }
        );
        if (response) {
          await fetchUsers();
          toast({
            title: "Simulated Action",
            description: `User ${userId} would be deleted.`,
            variant: "destructive",
          });
        }
      }
    } catch (err: any) {
      toast({
        title: "Fail to Remove User",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsUserRemoving(false);
    }
  };

  const handleAddNewUser = () => {
    toast({
      title: "Simulated Action",
      description: "Add new user form/modal would appear here.",
    });
  };

  return (
    <div className="min-h-screen bg-muted/40 p-4 md:p-8">
      <div className="container mx-auto">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Admin Panel</h1>
          </div>
          <p className="text-muted-foreground">
            Manage users and subscriptions. (This is a UI prototype with mock
            data)
          </p>
        </header>

        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl">Subscribers List</CardTitle>
              <CardDescription>
                View and manage all registered users.
              </CardDescription>
            </div>
            <Button
              onClick={handleAddNewUser}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <PlusCircle className="mr-2 h-5 w-5" /> Add New User
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscribers?.map((user: any) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-mono text-xs">
                        {user.id}
                      </TableCell>
                      <TableCell className="font-medium capitalize">
                        {user.name}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user?.subscription_plan?.plan_name.includes(
                              "Premium"
                            )
                              ? "default"
                              : "secondary"
                          }
                          className={
                            user?.subscription_plan?.plan_name.includes(
                              "Premium"
                            )
                              ? "bg-accent text-accent-foreground hover:bg-accent/80"
                              : ""
                          }
                        >
                          {user?.subscription_plan?.plan_name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(
                          user?.subscription_plan?.purchase_date
                        ).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user?.subscription_plan?.is_active
                              ? "outline"
                              : "destructive"
                          }
                          className={
                            user?.subscription_plan?.is_active
                              ? "border-green-500 text-green-700"
                              : ""
                          }
                        >
                          {user?.subscription_plan?.is_active
                            ? "Active"
                            : "InActive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-8 h-8"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                              <span className="sr-only">User Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleEditUser(user.id)}
                            >
                              <Edit3 className="mr-2 h-4 w-4" /> Edit User
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteUser(user.id)}
                              className={`${
                                isUserRemoving ? "cursor-not-allowed" : ""
                              } text-destructive focus:text-destructive focus:bg-destructive/10`}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {mockSubscribers.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No subscribers to display.
              </p>
            )}
          </CardContent>
        </Card>

        <footer className="mt-12 text-center text-sm text-muted-foreground">
          <p>
            Note: This admin panel is a UI demonstration. All data is mock and
            actions are simulated.
          </p>
          <p>
            Real admin functionality requires backend integration for
            authentication, database, and security.
          </p>
        </footer>
      </div>
    </div>
  );
}
