import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useSaveCallerUserProfile } from "../hooks/useQueries";

export default function ProfileSetupModal() {
  const [isOpen, setIsOpen] = useState(true);
  const [name, setName] = useState("");
  const saveProfile = useSaveCallerUserProfile();

  const handleSave = () => {
    saveProfile.mutate({ name });
    setIsOpen(false);
  };

  // Dialog bileşeni shadcn/ui gerektirir, basit haliyle:
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background p-6 rounded-lg shadow-lg max-w-md w-full border border-border">
        <h2 className="text-lg font-bold mb-2">Profil Oluştur</h2>
        <p className="text-sm text-muted-foreground mb-4">Devam etmek için bir kullanıcı adı belirleyin.</p>
        <Input 
          placeholder="Kullanıcı Adı" 
          value={name} 
          onChange={(e: any) => setName(e.target.value)} 
          className="mb-4"
        />
        <Button onClick={handleSave} className="w-full">Kaydet ve Başla</Button>
      </div>
    </div>
  );
}