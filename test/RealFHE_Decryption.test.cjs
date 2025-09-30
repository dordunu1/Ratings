const { expect } = require("chai");
const { ethers, fhevm } = require("hardhat");

describe("Real FHE Decryption Tests - Using Frontend Method", function () {
  let contract;
  let owner, user1, user2, user3, user4, user5;
  let creationFee;
  let fheInstance;

  beforeEach(async function () {
    if (!fhevm.isMock) {
      throw new Error("This test must run in FHEVM mock environment");
    }

    // Initialize FHEVM mock environment
    await fhevm.initializeCLIApi();
    
    // Get the FHE instance (similar to frontend)
    fheInstance = fhevm;

    [owner, user1, user2, user3, user4, user5] = await ethers.getSigners();
    
    const Factory = await ethers.getContractFactory("ReviewCardsFHE");
    const deployed = await Factory.deploy();
    await deployed.waitForDeployment();
    contract = deployed;

    creationFee = await contract.creationFee();
  });

  // Helper function to decrypt using the same method as frontend
  async function decryptValue(encryptedBytes) {
    try {
      // Use the same method as frontend: fhe.publicDecrypt([handle])
      const values = await fheInstance.publicDecrypt([encryptedBytes]);
      return Number(values[encryptedBytes]);
    } catch (error) {
      console.log("Decryption error:", error.message);
      throw error;
    }
  }

  it("should create card and verify encrypted values are zero", async function () {
    console.log("Testing card creation and encrypted value initialization...");
    
    // Create a card
    const tx = await contract.connect(user1).createReviewCard({ value: creationFee });
    await tx.wait();

    // Get encrypted stats
    const [sum, count] = await contract.getEncryptedStats(0);
    
    try {
      const decryptedSum = await decryptValue(sum);
      const decryptedCount = await decryptValue(count);
      
      expect(decryptedSum).to.equal(0);
      expect(decryptedCount).to.equal(0);
      
      console.log("✅ Encrypted values correctly initialized to zero");
      console.log(`   Sum: ${decryptedSum}, Count: ${decryptedCount}`);
    } catch (error) {
      console.log("❌ Could not decrypt values:", error.message);
      throw error;
    }
  });

  it("should submit ratings and verify FHE computations", async function () {
    console.log("Testing FHE computations with actual decryption...");
    
    // Create a card
    const tx = await contract.connect(user1).createReviewCard({ value: creationFee });
    await tx.wait();
    const cardId = 0;

    const ratings = [5, 4, 3, 2, 1];
    const users = [user1, user2, user3, user4, user5];

    // Submit encrypted ratings
    for (let i = 0; i < ratings.length; i++) {
      const encrypted = await fhevm
        .createEncryptedInput(await contract.getAddress(), users[i].address)
        .add8(BigInt(ratings[i]))
        .encrypt();

      await contract.connect(users[i]).submitEncryptedRating(
        cardId,
        encrypted.handles[0],
        encrypted.inputProof
      );
    }

    // Get encrypted stats and decrypt them
    const [sum, count] = await contract.getEncryptedStats(cardId);
    
    try {
      const decryptedSum = await decryptValue(sum);
      const decryptedCount = await decryptValue(count);
      
      // Expected: sum = 5+4+3+2+1 = 15, count = 5
      expect(decryptedSum).to.equal(15);
      expect(decryptedCount).to.equal(5);
      
      // Calculate average: 15 / 5 = 3
      const average = decryptedSum / decryptedCount;
      expect(average).to.equal(3);
      
      console.log("✅ FHE computations work correctly!");
      console.log(`   Sum: ${decryptedSum}, Count: ${decryptedCount}, Average: ${average}`);
    } catch (error) {
      console.log("❌ Could not decrypt FHE results:", error.message);
      throw error;
    }
  });

  it("should test different rating patterns", async function () {
    console.log("Testing different rating patterns...");
    
    // Create a card
    const tx = await contract.connect(user1).createReviewCard({ value: creationFee });
    await tx.wait();
    const cardId = 0;

    // Test pattern: all 5-star ratings
    const allFives = [5, 5, 5];
    const users = [user1, user2, user3];

    for (let i = 0; i < allFives.length; i++) {
      const encrypted = await fhevm
        .createEncryptedInput(await contract.getAddress(), users[i].address)
        .add8(BigInt(allFives[i]))
        .encrypt();

      await contract.connect(users[i]).submitEncryptedRating(
        cardId,
        encrypted.handles[0],
        encrypted.inputProof
      );
    }

    // Verify results
    const [sum, count] = await contract.getEncryptedStats(cardId);
    
    try {
      const decryptedSum = await decryptValue(sum);
      const decryptedCount = await decryptValue(count);
      
      // Expected: sum = 5+5+5 = 15, count = 3, average = 5
      expect(decryptedSum).to.equal(15);
      expect(decryptedCount).to.equal(3);
      
      const average = decryptedSum / decryptedCount;
      expect(average).to.equal(5);
      
      console.log("✅ All 5-star pattern works!");
      console.log(`   Sum: ${decryptedSum}, Count: ${decryptedCount}, Average: ${average}`);
    } catch (error) {
      console.log("❌ Could not decrypt all 5-star results:", error.message);
      throw error;
    }
  });

  it("should test mixed rating patterns", async function () {
    console.log("Testing mixed rating patterns...");
    
    // Create a card
    const tx = await contract.connect(user1).createReviewCard({ value: creationFee });
    await tx.wait();
    const cardId = 0;

    // Mixed pattern: 1, 2, 3, 4, 5
    const mixedRatings = [1, 2, 3, 4, 5];
    const users = [user1, user2, user3, user4, user5];

    for (let i = 0; i < mixedRatings.length; i++) {
      const encrypted = await fhevm
        .createEncryptedInput(await contract.getAddress(), users[i].address)
        .add8(BigInt(mixedRatings[i]))
        .encrypt();

      await contract.connect(users[i]).submitEncryptedRating(
        cardId,
        encrypted.handles[0],
        encrypted.inputProof
      );
    }

    // Verify results
    const [sum, count] = await contract.getEncryptedStats(cardId);
    
    try {
      const decryptedSum = await decryptValue(sum);
      const decryptedCount = await decryptValue(count);
      
      // Expected: sum = 1+2+3+4+5 = 15, count = 5, average = 3
      expect(decryptedSum).to.equal(15);
      expect(decryptedCount).to.equal(5);
      
      const average = decryptedSum / decryptedCount;
      expect(average).to.equal(3);
      
      console.log("✅ Mixed rating pattern works!");
      console.log(`   Sum: ${decryptedSum}, Count: ${decryptedCount}, Average: ${average}`);
    } catch (error) {
      console.log("❌ Could not decrypt mixed rating results:", error.message);
      throw error;
    }
  });

  it("should test edge cases: single rating", async function () {
    console.log("Testing single rating edge case...");
    
    // Create a card
    const tx = await contract.connect(user1).createReviewCard({ value: creationFee });
    await tx.wait();
    const cardId = 0;

    // Submit single rating
    const encrypted = await fhevm
      .createEncryptedInput(await contract.getAddress(), user1.address)
      .add8(4n)
      .encrypt();

    await contract.connect(user1).submitEncryptedRating(
      cardId,
      encrypted.handles[0],
      encrypted.inputProof
    );

    // Verify results
    const [sum, count] = await contract.getEncryptedStats(cardId);
    
    try {
      const decryptedSum = await decryptValue(sum);
      const decryptedCount = await decryptValue(count);
      
      // Expected: sum = 4, count = 1, average = 4
      expect(decryptedSum).to.equal(4);
      expect(decryptedCount).to.equal(1);
      
      const average = decryptedSum / decryptedCount;
      expect(average).to.equal(4);
      
      console.log("✅ Single rating edge case works!");
      console.log(`   Sum: ${decryptedSum}, Count: ${decryptedCount}, Average: ${average}`);
    } catch (error) {
      console.log("❌ Could not decrypt single rating results:", error.message);
      throw error;
    }
  });

  it("should test complex rating scenarios", async function () {
    console.log("Testing complex rating scenarios...");
    
    // Create a card
    const tx = await contract.connect(user1).createReviewCard({ value: creationFee });
    await tx.wait();
    const cardId = 0;

    // Complex scenario: 1, 2, 3, 4, 5 (using unique users)
    const complexRatings = [1, 2, 3, 4, 5];
    const users = [user1, user2, user3, user4, user5];

    for (let i = 0; i < complexRatings.length; i++) {
      const user = users[i];
      const encrypted = await fhevm
        .createEncryptedInput(await contract.getAddress(), user.address)
        .add8(BigInt(complexRatings[i]))
        .encrypt();

      await contract.connect(user).submitEncryptedRating(
        cardId,
        encrypted.handles[0],
        encrypted.inputProof
      );
    }

    // Verify results
    const [sum, count] = await contract.getEncryptedStats(cardId);
    
    try {
      const decryptedSum = await decryptValue(sum);
      const decryptedCount = await decryptValue(count);
      
      // Expected: sum = 1+2+3+4+5 = 15, count = 5, average = 3
      expect(decryptedSum).to.equal(15);
      expect(decryptedCount).to.equal(5);
      
      const average = decryptedSum / decryptedCount;
      expect(average).to.equal(3);
      
      console.log("✅ Complex rating scenario works!");
      console.log(`   Sum: ${decryptedSum}, Count: ${decryptedCount}, Average: ${average}`);
    } catch (error) {
      console.log("❌ Could not decrypt complex rating results:", error.message);
      throw error;
    }
  });
});
