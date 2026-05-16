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
  VStack,
  Box,
  HStack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { FiUserPlus, FiInfo } from "react-icons/fi";
import { AsyncSelect } from "chakra-react-select";
import axios from "axios";

function ModalTambahPersonil({
  isOpen,
  onClose,
  pegawaiTambahId,
  setPegawaiTambahId,
  onSave,
  detailPerjalanan,
  headerBg,
}) {
  return (
    <Modal
      closeOnOverlayClick={false}
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
    >
      <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
      <ModalContent borderRadius="xl" maxWidth="600px" mx={4}>
        <ModalHeader
          bg={headerBg}
          borderTopRadius="xl"
          display="flex"
          alignItems="center"
          gap={2}
        >
          <Icon as={FiUserPlus} color="purple.500" />
          Tambah Personil
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody p={8}>
          <VStack spacing={4} align="stretch">
            {detailPerjalanan?.personils?.length >= 5 ? (
              <Box
                bg="orange.50"
                p={4}
                borderRadius="lg"
                border="1px"
                borderColor="orange.200"
              >
                <HStack spacing={2}>
                  <Icon as={FiInfo} color="orange.500" />
                  <Text
                    fontSize="md"
                    color="orange.700"
                    fontWeight="medium"
                  >
                    Maksimal personil adalah 5 orang. Tidak dapat menambah
                    personil lagi.
                  </Text>
                </HStack>
              </Box>
            ) : (
              <>
                <Box
                  bg={useColorModeValue("blue.50", "blue.900")}
                  p={3}
                  borderRadius="md"
                  border="1px"
                  borderColor="blue.200"
                >
                  <HStack spacing={2}>
                    <Icon as={FiInfo} color="blue.500" />
                    <Text fontSize="sm" color="blue.700">
                      Personil saat ini:{" "}
                      {detailPerjalanan?.personils?.length} dari 5 orang
                    </Text>
                  </HStack>
                </Box>
                <FormControl>
                  <FormLabel fontSize="lg" fontWeight="semibold" mb={3}>
                    Pilih Pegawai
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

                        // Filter out pegawai yang sudah ada di personil
                        const existingPegawaiIds =
                          detailPerjalanan?.personils?.map(
                            (p) => p.pegawai.id
                          ) || [];

                        return filtered
                          .filter(
                            (val) => !existingPegawaiIds.includes(val.id)
                          )
                          .map((val) => ({
                            value: val.id,
                            label: val.nama,
                          }));
                      } catch (err) {
                        console.error(
                          "Failed to load options:",
                          err.message
                        );
                        return [];
                      }
                    }}
                    placeholder="Ketik nama pegawai untuk mencari..."
                    onChange={(selectedOption) => {
                      setPegawaiTambahId(selectedOption?.value || null);
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
              </>
            )}
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
            colorScheme="purple"
            leftIcon={<FiUserPlus />}
            onClick={onSave}
            _hover={{ transform: "translateY(-1px)" }}
            transition="all 0.2s"
            isDisabled={
              !pegawaiTambahId || detailPerjalanan?.personils?.length >= 5
            }
          >
            Tambah Personil
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default ModalTambahPersonil;
