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
  Skeleton,
  Button,
  Heading,
} from '@chakra-ui/react';
//import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextComponentType } from 'next';
import { useAccount } from 'wagmi';
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

const Lp: NextComponentType = () => {
  const { isConnected } = useAccount();

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

  const { data: pnl, refetch, isLoading } = useGetPnl(selectedAccount);

  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Flex mb={3} alignItems='center'>
        {/*<ConnectButton />*/}
        <Button onClick={onOpen} _hover={{bg: 'blue.600'}} colorScheme="blue" fontFamily="Inter, Helvetica,arial" letterSpacing="0.02rem">Connect Wallet</Button>

        <Modal
        isOpen={isOpen}
        onClose={onClose}
        closeOnOverlayClick={false}
        isCentered
      >
        <ModalOverlay />
        <ModalContent maxW='sm' p={6} m={2} textAlign="center">
          <Heading size="md" mb={2}>This app is no longer maintained</Heading>
          <Text>Visit <Link href="https://v3.synthetix.io" borderColor='#0a0b0c'>v3.synthetix.io</Link> to find apps that allow you to provide liquidity to the Synthetix protocol.</Text>
        </ModalContent>
      </Modal>

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
                        <ModifyCollateral
                          account={selectedAccount}
                          onSuccess={() => {
                            onModifyCollateralClose();
                          }}
                        />
                      </ModalBody>
                    </ModalContent>
                  </Modal>
                </Stat>
                <Stat borderLeft='1px solid #ffffff' pl={6} py={3}>
                  <StatLabel>PnL</StatLabel>
                  <StatNumber fontFamily='monospace' fontWeight={500}>
                    {isLoading ? (
                      <Skeleton width='100px' height='30px' />
                    ) : (
                      <Amount
                        value={wei(pnl && formatUnits(pnl.toString()))}
                        suffix='USDC'
                      />
                    )}
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
                        <ModifyPNL
                          account={selectedAccount}
                          onSuccess={() => {
                            onModifyPnlClose();
                            refetch();
                          }}
                        />
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
