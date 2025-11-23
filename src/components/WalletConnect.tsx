import { useWallet } from "../hooks/useWallet";
import { Button } from "@/components/ui/button";

export default function WalletConnect() {
  const { connect, disconnect, address, isConnected, isConnecting } = useWallet();

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <div className="px-4 py-2 bg-muted rounded-md text-sm font-mono">
          {address.slice(0, 6)}...{address.slice(-4)}
        </div>
        <Button variant="destructive" onClick={disconnect}>
          Çıkış
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={connect} disabled={isConnecting}>
      {isConnecting ? "Bağlanıyor..." : "Cüzdan Bağla"}
    </Button>
  );
}