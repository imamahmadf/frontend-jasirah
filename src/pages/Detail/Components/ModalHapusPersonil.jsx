import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Icon,
  VStack,
  Box,
  HStack,
  Text,
} from "@chakra-ui/react";
import { FiTrash2, FiInfo } from "react-icons/fi";

function ModalHapusPersonil({
  isOpen,
  onClose,
  onConfirm,
  namaPegawaiHapus,
}) {
  return (
    <Modal
      closeOnOverlayClick={false}
      isOpen={isOpen}
      onClose={onClose}
      size="md"
    >
      <ModalOverlay bg="redAlpha.600" backdropFilter="blur(4px)" />
      <ModalContent borderRadius="xl" maxWidth="500px" mx={4}>
        <ModalHeader
          bg="red.50"
          borderTopRadius="xl"
          display="flex"
          alignItems="center"
          gap={2}
        >
          <Icon as={FiTrash2} color="red.500" />
          Konfirmasi Hapus Personil
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody p={8}>
          <VStack spacing={4} align="stretch">
            <Box
              bg="red.50"
              p={4}
              borderRadius="lg"
              border="1px"
              borderColor="red.200"
            >
              <Text fontSize="lg" textAlign="center">
                Apakah Anda yakin ingin menghapus personil
              </Text>
              <Text
                fontSize="lg"
                fontWeight="bold"
                color="red.600"
                textAlign="center"
                mt={2}
              >
                {namaPegawaiHapus}
              </Text>
              <Text fontSize="lg" textAlign="center">
                dari perjalanan ini?
              </Text>
            </Box>
            <Box
              bg="orange.50"
              p={3}
              borderRadius="md"
              border="1px"
              borderColor="orange.200"
            >
              <HStack spacing={2}>
                <Icon as={FiInfo} color="orange.500" />
                <Text fontSize="sm" color="orange.700">
                  Tindakan ini tidak dapat dibatalkan.
                </Text>
              </HStack>
            </Box>
          </VStack>
        </ModalBody>
        <ModalFooter gap={3} p={8}>
          <Button
            variant="outline"
            onClick={onClose}
            _hover={{ transform: "translateY(-1px)" }}
            transition="all 0.2s"
          >
            Batal
          </Button>
          <Button
            colorScheme="red"
            leftIcon={<FiTrash2 />}
            onClick={onConfirm}
            _hover={{ transform: "translateY(-1px)" }}
            transition="all 0.2s"
          >
            Ya, Hapus Personil
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default ModalHapusPersonil;
