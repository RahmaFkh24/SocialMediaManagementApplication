import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Facebook, Instagram, Twitter, Linkedin, PlusCircle, RefreshCw, ExternalLink as LinkOff } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
};

const availablePlatforms = [
  { id: 'facebook', name: 'Facebook', icon: Facebook },
];

const AccountsPage = () => {
  const [accounts, setAccounts] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await axios.get('/api/accounts');
        setAccounts(response.data);
      } catch (err) {
        toast({ variant: "destructive", title: "Error", description: "Failed to fetch accounts" });
      }
    };
    fetchAccounts();
  }, []);

  const handleReconnect = async (id) => {
    try {
      toast({ title: "Reconnecting..." });
      window.location.href = `http://localhost:5000/auth/facebook`;
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    }
  };

  const handleDisconnect = async (id) => {
    try {
      await axios.delete(`/api/accounts/${id}`);
      setAccounts(prev => prev.filter(acc => acc._id !== id));
      toast({ title: "Account Disconnected" });
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    }
  };

  const handleConnectNew = (platformName) => {
    if (platformName === 'Facebook') {
      window.location.href = `http://localhost:5000/auth/facebook`;
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Connected Accounts</h1>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Connect New Account
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Connect a New Account</AlertDialogTitle>
              <AlertDialogDescription>
                Select the platform you want to connect. You will be redirected to authorize the connection.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4 space-y-4">
              {availablePlatforms.map(platform => (
                <AlertDialogAction key={platform.id} asChild className="w-full justify-start">
                  <Button variant="outline" onClick={() => handleConnectNew(platform.name)}>
                    <platform.icon className={`mr-2 h-5 w-5 ${platform.name === 'Facebook' ? 'text-blue-600' : 'text-pink-500'}`} />
                    Connect {platform.name}
                  </Button>
                </AlertDialogAction>
              ))}
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <motion.div
        variants={containerVariants}
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        <AnimatePresence>
          {accounts.map((account) => (
            <motion.div
              key={account._id}
              variants={itemVariants}
              layout
              exit="exit"
            >
              <Card className="overflow-hidden flex flex-col h-full">
                <CardHeader className="flex flex-row items-center space-x-4 pb-4">
                  <Avatar className="h-12 w-12 border-2 border-primary/20">
                    <AvatarImage src={account.avatar} alt={account.name} />
                    <AvatarFallback>{account.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-grow">
                    <CardTitle className="text-lg flex items-center">
                      <Facebook className="h-5 w-5 mr-2 text-blue-600" />
                      {account.platform}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground truncate">{account.name}</p>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col justify-center">
                  <div className="flex items-center justify-center mb-4">
                    <Badge variant={account.status === 'Active' ? 'secondary' : 'destructive'}
                      className={`${account.status === 'Active' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}`}>
                      {account.status}
                    </Badge>
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/50 p-4 flex justify-end space-x-2">
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary"
                    onClick={() => handleReconnect(account._id)}>
                    <RefreshCw className="mr-1 h-4 w-4" /> Refresh
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <LinkOff className="mr-1 h-4 w-4" /> Disconnect
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Disconnecting this account will remove it from the app. You may need to re-authorize it later.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDisconnect(account._id)}>
                          Disconnect
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {accounts.length === 0 && (
          <motion.div variants={itemVariants} className="md:col-span-2 lg:col-span-3 text-center text-muted-foreground py-10">
            No accounts connected yet. Click 'Connect New Account' to get started.
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default AccountsPage;