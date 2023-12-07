"use client";

import { ExtendedSpinner } from "@/components/ExtendedSpinner/ExtendedSpinner";
import { NETWORKS } from "@/data/const/networks";
import { Balance } from "@/scripts/types/Balance";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Client, isValidAddress } from "xrpl";
import { UserDetail } from "../components/UserDetail/UserDetail";

export const EvmSection = () => {
  const [xrplAddress, setXrplAddress] = useState<string | null>(null);
  const [balances, setBalances] = useState<Balance[]>([]);

  const params = useParams();
  const evmAddress = params?.address as unknown as string;

  useEffect(() => {
    const fetchXrplAddress = async () => {
      if (params && params.address) {
        const response = await fetch(
          `/api/user/xrpl-address?evmAddress=${params.address}`,
        );
        if (!response.ok) {
          setXrplAddress("");
          return;
        }

        const json = await response.json();
        if (isValidAddress(json.data)) {
          setXrplAddress(json.data);
        } else {
          setXrplAddress("");
        }
      }
    };

    fetchXrplAddress();
  }, [params]);

  useEffect(() => {
    const fetchBalances = async () => {
      if (xrplAddress) {
        const _balances = [] as Balance[];

        for (const network of NETWORKS) {
          switch (network.type) {
            case "evm":
              _balances.push({
                balance: 0,
                currency: "ETH",
                networkName: network.name,
              });
              break;
            case "xrpl":
              const client = new Client(network.url);
              try {
                const balance = await client.getXrpBalance(xrplAddress);
                _balances.push({
                  balance: Number(balance),
                  currency: "XRP",
                  networkName: network.name,
                });
              } catch (e: any) {
                _balances.push({
                  balance: 0,
                  currency: "XRP",
                  networkName: network.name,
                });
              }
              break;
          }
        }

        setBalances(_balances);
      }
    };

    fetchBalances();
  }, [evmAddress, xrplAddress]);

  if (!params || !evmAddress) {
    return <ExtendedSpinner />;
  }

  return (
    <UserDetail
      evmAddress={evmAddress}
      xrplAddress={xrplAddress}
      balances={balances}
    />
  );
};
