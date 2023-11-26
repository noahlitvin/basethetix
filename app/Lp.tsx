import { EditIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
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
} from "@chakra-ui/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import type { NextComponentType } from "next";
import { useAccount } from "wagmi";
import Modify from "./Modify";

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

  return (
    <>
      <Box mb={3}>
        <ConnectButton />
      </Box>
      {isConnected && (
        <Box>
          <Box mb={10}>
            <Text fontSize="sm" mb={1}>
              LP Accounts
            </Text>
            <Button
              mr={3}
              colorScheme="blue"
              size="xs"
              fontFamily="monospace"
              lineHeight="1"
              _hover={{ background: "blue.500" }}
            >
              #1234...4321
            </Button>
            <Button
              mr={3}
              colorScheme="white"
              size="xs"
              fontFamily="monospace"
              lineHeight="1"
              variant="outline"
            >
              #1234...4321
            </Button>
            <Button
              mr={3}
              colorScheme="blue"
              size="xs"
              variant="outline"
              fontFamily="monospace"
              lineHeight="1"
              borderColor="blue.500"
              color="white"
              _hover={{ background: "transparent" }}
            >
              CREATE ACCOUNT
            </Button>
          </Box>

          <Box mb={6} borderLeft="1px solid #ffffff" pl={6} py={1.5}>
            <Text fontSize="sm">Account</Text>
            <Text fontSize="2xl" fontFamily="monospace">
              #123123123123123123123123123123123123
            </Text>
          </Box>
          <StatGroup>
            <Stat borderLeft="1px solid #ffffff" pl={6} py={3}>
              <StatLabel>Collateral</StatLabel>
              <StatNumber fontFamily="monospace" fontWeight={500}>
                0.00 USDC
              </StatNumber>
              <StatHelpText onClick={onModifyCollateralOpen} cursor="pointer">
                <EditIcon />{" "}
                <Text as="span" borderBottom="1px dotted">
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
                    <Text mb={4} fontSize="sm">
                      The collateral you’ve provided to the protocol is used to
                      back the markets. You can’t initiate a withdrawal if you
                      have a negative PnL and, as a temporary security measure,
                      you must wait 24 hours to finalize a withdrawal.
                    </Text>
                    <Modify />
                  </ModalBody>
                </ModalContent>
              </Modal>
            </Stat>
            <Stat borderLeft="1px solid #ffffff" pl={6} py={3}>
              <StatLabel>PnL</StatLabel>
              <StatNumber fontFamily="monospace" fontWeight={500}>
                0.00 USDC
              </StatNumber>
              <StatHelpText onClick={onModifyPnlOpen} cursor="pointer">
                <EditIcon />{" "}
                <Text as="span" borderBottom="1px dotted">
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
                    <Text fontSize="sm" mb={4}>
                      Your PnL represents the profit or loss you’ve accrued from
                      backing the markets. This can increase and decrease over
                      time based on market performance.
                    </Text>
                    <Modify />
                  </ModalBody>
                </ModalContent>
              </Modal>
            </Stat>
          </StatGroup>
        </Box>
      )}
    </>
  );
};

export default Lp;
