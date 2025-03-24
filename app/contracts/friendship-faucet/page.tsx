/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useState, useEffect } from "react";
import { ethers } from "ethers";

interface ErrorInfo {
  code: number;
  data?: {
    cause?: string | null;
    location?: string;
  };
  message: string;
}

interface ErrorPayload {
  id: number;
  jsonrpc: string;
  method: string;
  params: Array<{
    data: string;
    from: string;
    gas: string;
    to: string;
  }>;
}

interface CustomError {
  action: string;
  reason: string;
  info: {
    error: ErrorInfo;
    payload: ErrorPayload;
  };
  code: string;
  version: string;
}
// ABI for the FriendshipFaucet contract
const contractABI = [
  "function owner() view returns (address)",
  "function REWARD_AMOUNT() view returns (uint256)",
  "function MY_AGE() view returns (uint256)",
  "function friendsList(address) view returns (bool)",
  "function hasReceivedReward(address) view returns (bool)",
  "function guessMyAge(uint256 ageGuess) external",
  "function deposit() external payable",
  "function withdraw() external",
];

// Replace with your deployed contract address
const contractAddress =
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_FRIENDSHIP_FAUCET || "";
const ownerAddress = process.env.NEXT_PUBLIC_OWNER_WALLET_ADDRESS;

export default function FriendshipFaucetPage() {
  // State variables
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [ageGuess, setAgeGuess] = useState<string>("");
  const [isFriend, setIsFriend] = useState<boolean>(false);
  const [hasReward, setHasReward] = useState<boolean>(false);
  const [contractBalance, setContractBalance] = useState<string>("0");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [transactionStatus, setTransactionStatus] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [rewardAmount, setRewardAmount] = useState<string>("0");
  const [attemptCount, setAttemptCount] = useState<number>(0);

  // Connect wallet
  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        setIsLoading(true);
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        const accounts = await provider.send("eth_requestAccounts", []);

        setProvider(provider);
        setSigner(signer);
        setContract(contract);
        setAccount(accounts[0]);

        // Get reward amount
        const reward = await contract.REWARD_AMOUNT();
        setRewardAmount(ethers.formatUnits(reward, "wei"));

        // Check if user is a friend
        updateUserStatus(accounts[0], contract);
        updateContractBalance(provider);

        setIsLoading(false);
      } else {
        setError("Ethereum wallet is not available. Please install MetaMask.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to connect wallet. Please try again.");
      setIsLoading(false);
    }
  };

  // Update user status
  const updateUserStatus = async (
    userAddress: string,
    contract: ethers.Contract
  ) => {
    try {
      const isFriend = await contract.friendsList(userAddress);
      const hasReward = await contract.hasReceivedReward(userAddress);
      const attempts = await contract.attempts(userAddress);
      setIsFriend(isFriend);
      setHasReward(hasReward);
      setAttemptCount(attempts);
    } catch (err) {
      console.error("Error checking user status:", err);
    }
  };

  // Update contract balance
  const updateContractBalance = async (provider: ethers.BrowserProvider) => {
    try {
      const balance = await provider.getBalance(contractAddress);
      setContractBalance(ethers.formatEther(balance));
    } catch (err) {
      console.error("Error fetching contract balance:", err);
    }
  };

  // Submit age guess
  const submitGuess = async () => {
    if (!contract || !ageGuess) return;

    try {
      setIsLoading(true);
      setTransactionStatus("Submitting your guess...");
      setError("");

      const tx = await contract.guessMyAge(parseInt(ageGuess));
      setTransactionStatus(
        "Transaction submitted! Waiting for confirmation..."
      );

      await tx.wait();
      setTransactionStatus(
        "Success! You've received your reward and are now a friend!"
      );

      // Update status
      if (account && contract) {
        updateUserStatus(account, contract);
      }
      if (provider) {
        updateContractBalance(provider);
      }

      setIsLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to submit your guess. Please try again.");
      setTransactionStatus("");
      setIsLoading(false);
    }
  };

  // Deposit funds (for testing)
  const depositFunds = async () => {
    if (!contract) return;

    try {
      setIsLoading(true);
      setTransactionStatus("Depositing funds...");
      setError("");

      const tx = await contract.deposit({ value: ethers.parseEther("0.001") });
      setTransactionStatus(
        "Deposit transaction submitted! Waiting for confirmation..."
      );

      await tx.wait();
      setTransactionStatus("Deposit successful!");

      if (provider) {
        updateContractBalance(provider);
      }

      setIsLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to deposit funds. Please try again.");
      setTransactionStatus("");
      setIsLoading(false);
    }
  };

  const withdrawFunds = async () => {
    if (!contract) return;

    try {
      setIsLoading(true);
      setTransactionStatus("Withdrawing funds...");
      setError("");

      const tx = await contract.withdraw();
      setTransactionStatus(
        "Withdrawal transaction submitted! Waiting for confirmation..."
      );

      await tx.wait();
      setTransactionStatus("Withdrawal successful!");

      if (provider) {
        updateContractBalance(provider);
      }

      setIsLoading(false);
    } catch (err: unknown) {
      const customError = err as unknown as CustomError;
      console.error(customError);
      setError(customError.info.error.message);
      setTransactionStatus("");
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <div className="bg-white p-6 shadow-lg rounded-lg">
        <h1 className="text-2xl font-bold mb-4">Friendship Faucet</h1>
        <p className="text-gray-600 mb-4">
          Guess the correct age to become a friend and receive a reward!
        </p>
        <div className="border-t border-gray-200 my-4"></div>

        {!account ? (
          <button
            onClick={connectWallet}
            disabled={isLoading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition"
          >
            {isLoading ? "Connecting..." : "Connect Wallet"}
          </button>
        ) : (
          <>
            <div className="mb-4 space-y-2">
              <p>
                <strong>Connected Account:</strong> {account.slice(0, 6)}...
                {account.slice(-4)}
              </p>
              <p>
                <strong>Contract Balance:</strong> {contractBalance} ETH
              </p>
              <p>
                <strong>Reward Amount:</strong> {rewardAmount} wei
              </p>
              <p>
                <strong>Friend Status:</strong>{" "}
                {isFriend ? "You are a friend! 🎉" : "Not a friend yet"}
              </p>
              <p>
                <strong>Reward Status:</strong>{" "}
                {hasReward ? "Received ✓" : "Not received yet"}
              </p>
              <p>
                <strong>Attempts:</strong> {3 - attemptCount} remaining
              </p>
            </div>

            <div className="border-t border-gray-200 my-4"></div>

            {!hasReward ? (
              <div className="mb-4">
                <p className="mb-2">
                  Guess my age to become my friend and receive a reward:
                </p>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={ageGuess}
                    onChange={(e) => setAgeGuess(e.target.value)}
                    placeholder="Enter age"
                    disabled={isLoading}
                    className="flex-1 p-2 border border-gray-300 rounded"
                  />
                  <button
                    onClick={submitGuess}
                    disabled={!ageGuess || isLoading}
                    className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded transition disabled:opacity-50"
                  >
                    {isLoading ? "Submitting..." : "Submit Guess"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="mb-4 p-3 bg-green-50 text-green-800 rounded">
                You&apos;ve already received your reward!
              </div>
            )}

            <div className="border-t border-gray-200 my-4"></div>
            <div className="flex flex-col gap-2">
              <button
                onClick={depositFunds}
                disabled={isLoading}
                className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-1 px-3 rounded text-sm transition"
              >
                Deposit Funds (0.001 ETH)
              </button>

              <button
                onClick={withdrawFunds}
                disabled={isLoading}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-3 rounded text-sm transition"
              >
                Withdraw Funds
              </button>
            </div>

            {transactionStatus && (
              <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded">
                <p>{transactionStatus}</p>
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-800 rounded">
                {error}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
