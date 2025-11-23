import { useState } from 'react';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function ProfileSetupModal() {
  const [name, setName] = useState('');
  const saveProfile = useSaveCallerUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Lütfen bir isim girin');
      return;
    }

    try {
      await saveProfile.mutateAsync({
        name: name.trim(),
        totalPoints: BigInt(0),
        successfulPredictions: BigInt(0),
        failedPredictions: BigInt(0),
      });
      toast.success('Profil oluşturuldu!');
    } catch (error) {
      toast.error('Profil oluşturulurken hata oluştu');
      console.error(error);
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Hoş Geldiniz!</DialogTitle>
          <DialogDescription>
            Başlamak için lütfen adınızı girin.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">İsim</Label>
            <Input
              id="name"
              placeholder="Adınızı girin"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <Button type="submit" className="w-full" disabled={saveProfile.isPending}>
            {saveProfile.isPending ? 'Kaydediliyor...' : 'Devam Et'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
