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
  Icon,
} from "@chakra-ui/react";
import { FiEdit3, FiCheckCircle } from "react-icons/fi";
import { AsyncSelect } from "chakra-react-select";
import axios from "axios";

function ModalEditPersonil({
  isOpen,
  onClose,
  pegawaiId,
  setPegawaiId,
  onSave,
  headerBg,
}) {
  return (
    <Modal closeOnOverlayClick={false} isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
      <ModalContent borderRadius="xl" maxWidth="600px" mx={4}>
        <ModalHeader
          bg={headerBg}
          borderTopRadius="xl"
          display="flex"
          alignItems="center"
          gap={2}
        >
          <Icon as={FiEdit3} color="purple.500" />
          Edit Personil
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody p={8}>
          <FormControl>
            <FormLabel fontSize="lg" fontWeight="semibold" mb={3}>
              Pilih Pegawai Baru
            </FormLabel>
            <AsyncSelect
              loadOptions={async (inputValue) => {
                if (!inputValue) return [];
                try {
                  const res = await axios.get(
                    `${
                      import.meta.env.VITE_REACT_APP_API_BASE_URL
                    }/pegawai/search?q=${inputValue}`
                  );

                  const filtered = res.data.result;

                  return filtered.map((val) => ({
                    value: val.id,
                    label: val.nama,
                  }));
                } catch (err) {
                  console.error("Failed to load options:", err.message);
                  return [];
                }
              }}
              placeholder="Ketik nama pegawai untuk mencari..."
              onChange={(selectedOption) => {
                setPegawaiId(selectedOption?.value || null);
              }}
              components={{
                DropdownIndicator: () => null,
                IndicatorSeparator: () => null,
              }}
              chakraStyles={{
                container: (provided) => ({
                  ...provided,
                  borderRadius: "8px",
                }),
                control: (provided) => ({
                  ...provided,
                  backgroundColor: "white",
                  border: "2px solid",
                  borderColor: "gray.200",
                  height: "50px",
                  _hover: { borderColor: "blue.300" },
                  _focus: {
                    borderColor: "blue.500",
                    boxShadow: "0 0 0 1px blue.500",
                  },
                  minHeight: "50px",
                }),
                option: (provided, state) => ({
                  ...provided,
                  bg: state.isFocused ? "purple.500" : "white",
                  color: state.isFocused ? "white" : "black",
                  _hover: { bg: "purple.500", color: "white" },
                }),
              }}
            />
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
          >
            Simpan Perubahan
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default ModalEditPersonil;
