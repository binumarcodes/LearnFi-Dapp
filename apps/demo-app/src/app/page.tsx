"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Abstraxion,
  useAbstraxionAccount,
  useAbstraxionSigningClient,
  useModal,
} from "@burnt-labs/abstraxion";
import { Button } from "@burnt-labs/ui";
import "@burnt-labs/ui/dist/index.css";
import { SignArb } from "../components/sign-arb.tsx";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../components/util/firebase";
import UserInfoModal from "../components/UserInfoModal";

export default function Page(): JSX.Element {
  const router = useRouter();
  const { data: account } = useAbstraxionAccount();
  const { client, signArb, logout } = useAbstraxionSigningClient();

  // State hooks
  const [, setShowModal] = useModal();
  const [loading, setLoading] = useState(false);
  const [instantiateResult, setInstantiateResult] = useState<InstantiateResult | undefined>(undefined);
  const [showUserInfoModal, setShowUserInfoModal] = useState(false);
  const [userChecked, setUserChecked] = useState(false);

  const blockExplorerUrl = `https://www.mintscan.io/xion-testnet/tx/${instantiateResult?.transactionHash}`;

  // Check user existence in Firebase when account changes
  useEffect(() => {
    if (account?.bech32Address && !userChecked) {
      checkUserExists(account.bech32Address);
    }
  }, [account?.bech32Address, userChecked]);

  async function checkUserExists(walletAddress: string): Promise<void> {
    try {
      const userDocRef = doc(db, "learners", walletAddress);
      const userDocSnap = await getDoc(userDocRef);
      
      if (!userDocSnap.exists()) {
        // User doesn't exist, show modal for additional info
        setShowUserInfoModal(true);
      } else {
        // User exists, proceed to dashboard
        router.push("/dashboard");
      }
      setUserChecked(true);
    } catch (error) {
      console.error("Error checking user existence:", error);
    }
  }

  async function handleUserInfoSubmit(fullName: string, username: string, avatar: string): Promise<void> {
    try {
      if (!account?.bech32Address) return;
      
      await setDoc(doc(db, "learners", account.bech32Address), {
        walletAddress: account.bech32Address,
        fullName,
        username,
        avatar,
        createdAt: new Date().toISOString(),
      });
      
      setShowUserInfoModal(false);
      router.push("/dashboard");
    } catch (error) {
      console.error("Error creating user document:", error);
    }
  }

  async function claimSeat(): Promise<void> {
    setLoading(true);
    try {
      const msg = {
        type_urls: ["/cosmwasm.wasm.v1.MsgInstantiateContract"],
        grant_configs: [
          {
            description: "Ability to instantiate contracts",
            optional: false,
            authorization: {
              type_url: "/cosmos.authz.v1beta1.GenericAuthorization",
              value: "CigvY29zbXdhc20ud2FzbS52MS5Nc2dJbnN0YW50aWF0ZUNvbnRyYWN0",
            },
          },
        ],
        fee_config: {
          description: "Sample fee config for testnet-2",
          allowance: {
            type_url: "/cosmos.feegrant.v1beta1.BasicAllowance",
            value: "Cg8KBXV4aW9uEgY1MDAwMDA=",
          },
        },
        admin: account.bech32Address,
      };

      const instantiateRes = await client?.instantiate(account.bech32Address, 33, msg, "instantiate on expo demo", "auto");

      if (!instantiateRes) {
        throw new Error("Instantiate failed.");
      }

      setInstantiateResult(instantiateRes);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black">
      <main className="m-auto flex min-h-full max-w-xs flex-col items-center justify-center gap-4 p-4">
        <h1 className="text-2xl font-bold tracking-tighter text-white">ABSTRAXION for LEARNFI</h1>
        <Button
          fullWidth
          onClick={() => {
            setShowModal(true);
          }}
          structure="base"
        >
          {account?.bech32Address ? (
            <div className="flex items-center justify-center">VIEW ACCOUNT</div>
          ) : (
            "CONNECT"
          )}
        </Button>

        {client ? (
          <>
            <Button
              disabled={loading}
              fullWidth
              onClick={() => {
                void claimSeat();
              }}
              structure="base"
            >
              {loading ? "LOADING..." : "Instantiate Sample Treasury"}
            </Button>
            {logout ? (
              <Button
                disabled={loading}
                fullWidth
                onClick={() => {
                  logout();
                }}
                structure="base"
              >
                LOGOUT
              </Button>
            ) : null}
            {signArb ? <SignArb /> : null}
          </>
        ) : null}

        <Abstraxion
          onClose={() => {
            setShowModal(false);
          }}
        />

        {showUserInfoModal && (
          <UserInfoModal 
            onClose={() => setShowUserInfoModal(false)}
            onSubmit={handleUserInfoSubmit}
          />
        )}

        {instantiateResult ? (
          <div className="flex flex-col rounded border-2 border-white p-2">
            <div className="mt-2">
              <p className="text-gray-400">
                <span className="font-bold">Transaction Hash</span>
              </p>
              <p className="text-sm text-white">{instantiateResult.transactionHash}</p>
            </div>
            <div className="mt-2">
              <p className="text-gray-400">
                <span className="font-bold">Block Height:</span>
              </p>
              <p className="text-sm text-white">{instantiateResult.height}</p>
            </div>
            <div className="mt-2">
              <Link
                className="text-white underline visited:text-purple-400"
                href={blockExplorerUrl}
                target="_blank"
              >
                View in Block Explorer
              </Link>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}