'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { usePassword } from "../contexts/PasswordContext";

interface PasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function PasswordDialog({ isOpen, onClose, onSuccess }: PasswordDialogProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { verifyPassword } = usePassword();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const isValid = await verifyPassword(password);
    if (isValid) {
      setPassword("");
      onSuccess();
      onClose();
    } else {
      setError("パスワードが正しくありません");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-[425px] bg-white shadow-sm border border-green-100"
      >
        <DialogHeader>
          <DialogTitle className="text-green-700 font-medium">管理者パスワードを入力してください</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="p-2">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="パスワード"
              className="w-full border-green-100 focus:ring-green-200 focus-visible:ring-green-200 focus:border-green-300"
            />
            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="hover:bg-green-50/50 hover:text-green-700"
            >
              キャンセル
            </Button>
            <Button 
              type="submit"
              className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 text-green-700 hover:bg-green-100 hover:text-green-800"
            >
              確認
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}