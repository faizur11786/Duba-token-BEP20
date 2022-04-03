// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require( "hardhat" );
const { mkdirSync, existsSync, readFileSync, writeFileSync } = require( "fs" );

async function main () {
  mkdirSync( "abi", { recursive: true } );
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const DubaiToken = await hre.ethers.getContractFactory( "DubaiToken" );
  const dubaiToken = await DubaiToken.deploy();
  console.log( "Waiting for deployment" );
  await dubaiToken.deployed();
  console.log( "DubaiToken deployed to:", dubaiToken.address );
  const reciept = await dubaiToken.deployTransaction.wait();
  createAbiJSON( dubaiToken, reciept, "DubaiToken" );
}

function createAbiJSON ( artifact, reciept, filename ) {
  const { chainId } = hre.network.config;
  if ( existsSync( `${__dirname}/../abi/${filename}.json` ) ) {
    const prevData = JSON.parse(
      readFileSync( `${__dirname}/../abi/${filename}.json`, "utf8" )
    );
    const data = {
      abi: JSON.parse( artifact.interface.format( "json" ) ),
      networks: prevData.networks,
    };
    data.networks[chainId] = {
      address: artifact.address,
      blockNumber: reciept.blockNumber,
    };
    writeFileSync( `${__dirname}/../abi/${filename}.json`, JSON.stringify( data ) );
  } else {
    const data = {
      abi: JSON.parse( artifact.interface.format( "json" ) ),
      networks: {},
    };
    data.networks[chainId] = {
      address: artifact.address,
      blockNumber: reciept.blockNumber,
    };
    writeFileSync( `${__dirname}/../abi/${filename}.json`, JSON.stringify( data ) );
  }
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch( ( error ) => {
  console.error( error );
  process.exitCode = 1;
} );
