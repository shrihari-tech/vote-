const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("GovernanceVoting", function () {
  let GovernanceVoting;
  let governanceVoting;
  let chairperson;
  let shareholder;
  let otherAccount;

  beforeEach(async function () {
    [chairperson, shareholder, otherAccount] = await ethers.getSigners();

    GovernanceVoting = await ethers.getContractFactory("GovernanceVoting");
    governanceVoting = await GovernanceVoting.deploy();
    //await governanceVoting.deployed();
  });

  it("should initialize the contract", async function () {
    const proposals = ["Proposal 1", "Proposal 2"];
    await governanceVoting.initialize(chairperson.address, proposals);

    expect(await governanceVoting.getChairperson()).to.equal(chairperson.address);
    const proposalsList = await governanceVoting.getProposals();
    expect(proposalsList.length).to.equal(2);
    expect(proposalsList[0].description).to.equal("Proposal 1");
    expect(proposalsList[1].description).to.equal("Proposal 2");
  });

  it("should add a proposal", async function () {
    const proposals = ["Proposal 1"];
    await governanceVoting.initialize(chairperson.address, proposals);

    await governanceVoting.addProposal("Proposal 2");
    const proposalsList = await governanceVoting.getProposals();
    expect(proposalsList.length).to.equal(2);
    expect(proposalsList[1].description).to.equal("Proposal 2");
  });

  it("should give right to vote to a shareholder", async function () {
    const proposals = ["Proposal 1"];
    await governanceVoting.initialize(chairperson.address, proposals);

    await governanceVoting.giveRightToVote(shareholder.address);
    const voter = await governanceVoting.voters(shareholder.address);
    expect(voter.weight).to.equal(1);
  });

  it("should allow a shareholder to vote", async function () {
    const proposals = ["Proposal 1"];
    await governanceVoting.initialize(chairperson.address, proposals);
    await governanceVoting.giveRightToVote(shareholder.address);

    await governanceVoting.connect(shareholder).vote(1);
    const proposalsList = await governanceVoting.getProposals();
    expect(proposalsList[0].voteCount).to.equal(1);
  });

  it("should invalidate a proposal", async function () {
    const proposals = ["Proposal 1"];
    await governanceVoting.initialize(chairperson.address, proposals);

    await governanceVoting.invalidateProposal(1);
    const invalidProposalsList = await governanceVoting.getInvalidProposals();
    expect(invalidProposalsList.length).to.equal(1);
    expect(invalidProposalsList[0].description).to.equal("Proposal 1");
  });

});
