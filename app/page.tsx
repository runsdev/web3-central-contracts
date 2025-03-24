/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function Home() {
  const [contracts, setContracts] = useState([
    { name: "Friendship Faucet", path: "/contracts/friendship-faucet" },
    // { name: "NFT Marketplace", path: "/contracts/marketplace" },
    // { name: "Staking", path: "/contracts/staking" },
    // { name: "Governance", path: "/contracts/governance" },
    // { name: "Liquidity Pool", path: "/contracts/liquidity" },
  ]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          RunsDev Web3 Contract Suite
        </h1>

        <div className="bg-white/30 p-8 rounded-lg backdrop-blur-sm">
          <p className="text-xl mb-6">
            Welcome to the RunsDev Contract Suite - a comprehensive collection
            of blockchain contracts designed to power your Web3 applications.
            Our ecosystem provides everything you need to build decentralized
            applications with confidence.
          </p>

          <p className="text-lg mb-10">
            Explore our collection of smart contracts below to get started with
            your next Web3 project.
          </p>

          <h2 className="text-2xl font-semibold mb-4">Available Contracts</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contracts.map((contract, index) => (
              <Link
                key={index}
                href={contract.path}
                className="block p-6 bg-white/20 rounded-lg hover:bg-white/30 transition-all"
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-blue-600 font-bold">{index + 1}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium">{contract.name}</h3>
                    <p className="text-gray-700">
                      View documentation and interact
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-700">
              Powered by RunsDev • Built for Web3 developers
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
