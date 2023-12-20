import { EditIcon } from '@chakra-ui/icons';
import {
  Box,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Stat,
  StatGroup,
  StatHelpText,
  StatLabel,
  StatNumber,
  Text,
  useDisclosure,
  Link,
  Image,
  Button,
} from '@chakra-ui/react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextComponentType } from 'next';
import { useAccount, useContractRead } from 'wagmi';
import Accounts from './Accounts';
import { useState } from 'react';
import { useGetCollateral } from '../hooks/useGetCollateral';
import { ModifyCollateral } from './ModifyCollateral';
import { Withdrawals } from './Withdrawals';
import { useGetPnl } from '../hooks/useGetPnl';
import { formatUnits } from 'ethers/lib/utils.js';
import { ModifyPNL } from './ModifyPNL';
import { Amount } from '../components/Amount';
import { wei } from '@synthetixio/wei';
import { useContract } from '../hooks/useContract';
import { useGetPreferredPool } from '../hooks/useGetPreferredPool';
import { useDefaultNetwork } from '../hooks/useDefaultNetwork';
import { sUSDC_address } from '../constants/markets';

const Lp: NextComponentType = () => {
  const { isConnected, connector } = useAccount();

  const {
    isOpen: isModifyCollateralOpen,
    onOpen: onModifyCollateralOpen,
    onClose: onModifyCollateralClose,
  } = useDisclosure();

  const {
    isOpen: isModifyPnlOpen,
    onOpen: onModifyPnlOpen,
    onClose: onModifyPnlClose,
  } = useDisclosure();

  const [selectedAccount, setSelectedAccount] = useState<string | undefined>();

  const { totalAssigned: collateral } = useGetCollateral(selectedAccount);

  const pnl = useGetPnl(selectedAccount);

  const synthetix = useContract('SYNTHETIX');
  const poolId = useGetPreferredPool();
  const { network } = useDefaultNetwork();

  const { data: pnl2 } = useContractRead({
    address: synthetix.address,
    abi: synthetix.abi,
    functionName: 'getPositionDebt',
    args: [
      '170141183460469231731687303715884105728',
      poolId,
      sUSDC_address[network],
    ],
  });

  return (
    <>
      <Flex mb={3} alignItems='center'>
        <ConnectButton />

        <Flex ml='auto' alignItems='center'>
          <Image
            src='/base.png'
            width='20px'
            height='20px'
            alt='base'
            mr={1.5}
            mt={0}
          />
          <Link
            isExternal
            fontSize='xs'
            href='http://bridge.base.org/'
            borderStyle='dotted'
          >
            Bridge ETH + USDC to Base
          </Link>
        </Flex>
      </Flex>
      {isConnected && (
        <Box>
          <Accounts
            selectedAccount={selectedAccount}
            setSelectedAccount={setSelectedAccount}
          />
          {selectedAccount && (
            <>
              <Box mb={6} borderLeft='1px solid #ffffff' pl={6} py={1.5}>
                <Text fontSize='sm'>Account</Text>
                <Text fontSize='2xl' fontFamily='monospace'>
                  #{selectedAccount}
                </Text>
              </Box>
              <StatGroup>
                <Stat borderLeft='1px solid #ffffff' pl={6} py={3}>
                  <StatLabel>Collateral</StatLabel>
                  <StatNumber fontFamily='monospace' fontWeight={500}>
                    {collateral?.toLocaleString()} USDC
                  </StatNumber>
                  <StatHelpText
                    onClick={onModifyCollateralOpen}
                    cursor='pointer'
                  >
                    <EditIcon />{' '}
                    <Text as='span' borderBottom='1px dotted'>
                      Modify
                    </Text>
                  </StatHelpText>
                  <Modal
                    isCentered
                    isOpen={isModifyCollateralOpen}
                    onClose={onModifyCollateralClose}
                  >
                    <ModalOverlay />
                    <ModalContent>
                      <ModalHeader pb={0}>Modify Collateral</ModalHeader>
                      <ModalCloseButton />
                      <ModalBody>
                        <Text mb={3} fontSize='sm'>
                          The collateral you’ve provided to the protocol is used
                          to back the markets. You can’t initiate a withdrawal
                          if you have a negative PnL and, as a temporary
                          security measure, you must wait 24 hours to finalize a
                          withdrawal.
                        </Text>
                        <ModifyCollateral account={selectedAccount} />
                      </ModalBody>
                    </ModalContent>
                  </Modal>
                </Stat>
                <Stat borderLeft='1px solid #ffffff' pl={6} py={3}>
                  <StatLabel>PnL</StatLabel>
                  <StatNumber fontFamily='monospace' fontWeight={500}>
                    <Amount
                      value={wei(pnl && formatUnits(pnl.toString()))}
                      suffix='USDC'
                    />
                  </StatNumber>
                  <StatHelpText onClick={onModifyPnlOpen} cursor='pointer'>
                    <EditIcon />{' '}
                    <Text as='span' borderBottom='1px dotted'>
                      Modify
                    </Text>
                  </StatHelpText>
                  <Modal
                    isCentered
                    isOpen={isModifyPnlOpen}
                    onClose={onModifyPnlClose}
                  >
                    <ModalOverlay />
                    <ModalContent>
                      <ModalHeader pb={0}>Modify PnL</ModalHeader>
                      <ModalCloseButton />
                      <ModalBody>
                        <Text fontSize='sm' mb={3}>
                          Your PnL represents the profit or loss you’ve accrued
                          from backing the markets. This can increase and
                          decrease over time based on market performance.
                        </Text>
                        <ModifyPNL account={selectedAccount} />
                      </ModalBody>
                    </ModalContent>
                  </Modal>
                </Stat>
              </StatGroup>
              <Withdrawals account={selectedAccount} />
            </>
          )}
        </Box>
      )}
    </>
  );
};

export default Lp;
