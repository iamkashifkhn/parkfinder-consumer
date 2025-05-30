"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Mail, Phone, Lock, CreditCard } from "lucide-react";
import { Loader } from "@/components/ui/loader";
import { useToast } from "@/components/ui/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { authService } from "@/services/authService";
import { passwordSchema, type PasswordFormValues } from "@/lib/schemas";

const profileSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional()
    .refine((val) => !val || /^[+]?[\d\s-()]{7,}$/.test(val), {
      message: "Please enter a valid phone number",
    }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  userType: string;
}

export default function AccountPage() {
  const { toast } = useToast();
  const [isEmailVerificationPending, setIsEmailVerificationPending] = useState(false);
  const [originalEmail, setOriginalEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await authService.getMe() as unknown as UserData;
        console.log(userData, "hello");
        setOriginalEmail(userData.email);
        
        profileForm.reset({
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          phone: userData.phoneNumber || "",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch user data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [profileForm, toast]);

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      await authService.updateProfile({
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phone
      });
      
      toast({
        title: "Success",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const onPasswordSubmit = async (data: PasswordFormValues) => {
    try {
      await authService.changePassword(data.currentPassword, data.newPassword);
      
      toast({
        title: "Success",
        description: "Your password has been updated successfully.",
      });

      // Reset the form
      passwordForm.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update password. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Loader
        text="Loading Account Page..."
        subText="Please wait while we fetch the data"
      />
    );
  }

  return (
    <div className="container py-24 px-4 mx-auto">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold tracking-tight">Account</h1>
          <p className="text-muted-foreground">
            Manage your account details and preferences.
          </p>
        </div>

        <Tabs defaultValue="personal" className="flex gap-12">
          <TabsList className="flex flex-col h-fit w-48 bg-muted p-2 space-y-2">
            <TabsTrigger 
              value="personal" 
              className="w-full justify-start px-3"
            >
              Personal Info
            </TabsTrigger>
            <TabsTrigger 
              value="security" 
              className="w-full justify-start px-3"
            >
              Security
            </TabsTrigger>
            <TabsTrigger 
              value="billing" 
              className="w-full justify-start px-3"
            >
              Billing
            </TabsTrigger>
          </TabsList>

          <div className="flex-1">
            <TabsContent value="personal" className="mt-0">
              <Card className="p-6">
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onSubmit)} className="space-y-4">
                    <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={profileForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel>First Name</FormLabel>
                            <div className="relative">
                              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <FormControl>
                                <Input className="pl-10" {...field} />
                              </FormControl>
                            </div>
                            <FormMessage />
                          </FormItem> 
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel>Last Name</FormLabel>
                            <div className="relative">
                              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <FormControl>
                                <Input className="pl-10" {...field} />
                              </FormControl>
                            </div>
                            <FormMessage />
                          </FormItem> 
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel>Email</FormLabel>
                            <div className="relative">
                              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <FormControl>
                                <Input className="pl-10" {...field} disabled />
                              </FormControl>
                            </div>
                            <FormMessage />
                            <p className="text-sm text-muted-foreground">
                              Email cannot be changed. Please contact support if you need to update your email.
                            </p>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel>Phone (Optional)</FormLabel>
                            <div className="relative">
                              <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <FormControl>
                                <Input className="pl-10" {...field} />
                              </FormControl>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button 
                      type="submit"
                      disabled={!profileForm.formState.isDirty || profileForm.formState.isSubmitting}
                    >
                      {profileForm.formState.isSubmitting ? "Saving..." : "Save Changes"}
                    </Button>
                  </form>
                </Form>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="mt-0">
              <Card className="p-6">
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                    <h2 className="text-lg font-semibold mb-4">Password</h2>
                    
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel>Current Password</FormLabel>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <FormControl>
                              <Input type="password" className="pl-10" {...field} />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel>New Password</FormLabel>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <FormControl>
                              <Input type="password" className="pl-10" {...field} />
                            </FormControl>
                          </div>
                          <FormMessage />
                          <p className="text-sm text-muted-foreground">
                            Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character.
                          </p>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel>Confirm New Password</FormLabel>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <FormControl>
                              <Input type="password" className="pl-10" {...field} />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit"
                      disabled={!passwordForm.formState.isDirty || passwordForm.formState.isSubmitting}
                    >
                      {passwordForm.formState.isSubmitting ? "Updating..." : "Update Password"}
                    </Button>
                  </form>
                </Form>
              </Card>
            </TabsContent>

            <TabsContent value="billing" className="mt-0">
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Billing Information</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Card Number</label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input className="pl-10" placeholder="**** **** **** ****" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Expiry Date</label>
                      <Input placeholder="MM/YY" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">CVV</label>
                      <Input type="password" placeholder="***" maxLength={3} />
                    </div>
                  </div>
                  
                  <Button>Save Card Details</Button>
                </div>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
} 