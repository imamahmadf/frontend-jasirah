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
  FormControl,
  FormLabel,
  Select,
  Icon,
} from "@chakra-ui/react";
import { FiEdit3, FiCheckCircle } from "react-icons/fi";

function ModalEditSubKegiatan({
  isOpen,
  onClose,
  editSubKegiatanId,
  setEditSubKegiatanId,
  dataSubKegiatan,
  onSave,
  headerBg,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
      <ModalContent borderRadius="xl" maxWidth="500px" mx={4}>
        <ModalHeader
          bg={headerBg}
          borderTopRadius="xl"
          display="flex"
          alignItems="center"
          gap={2}
        >
          <Icon as={FiEdit3} color="purple.500" />
          Edit Sub Kegiatan
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody p={8}>
          <FormControl>
            <FormLabel fontSize="lg" fontWeight="semibold">
              Pilih Sub Kegiatan Baru
            </FormLabel>
            <Select
              placeholder="Pilih Sub Kegiatan"
              value={editSubKegiatanId || ""}
              onChange={(e) => setEditSubKegiatanId(e.target.value)}
              borderRadius="lg"
              border="2px solid"
              borderColor="gray.200"
              _hover={{ borderColor: "purple.300" }}
              _focus={{
                borderColor: "purple.500",
                boxShadow: "0 0 0 1px purple.500",
              }}
              height="50px"
            >
              {dataSubKegiatan &&
                dataSubKegiatan.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.subKegiatan}
                  </option>
                ))}
            </Select>
          </FormControl>
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
            colorScheme="purple"
            leftIcon={<FiCheckCircle />}
            onClick={onSave}
            _hover={{ transform: "translateY(-1px)" }}
            transition="all 0.2s"
            isDisabled={!editSubKegiatanId}
          >
            Simpan Perubahan
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default ModalEditSubKegiatan;
