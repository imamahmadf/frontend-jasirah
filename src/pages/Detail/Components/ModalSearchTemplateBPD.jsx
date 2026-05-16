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
  Badge,
  useColorModeValue,
} from "@chakra-ui/react";
import { FiSearch, FiCheckCircle, FiMapPin, FiDollarSign } from "react-icons/fi";
import { AsyncSelect } from "chakra-react-select";
import axios from "axios";

function ModalSearchTemplateBPD({
  isOpen,
  onClose,
  selectedTemplateBPD,
  setSelectedTemplateBPD,
  onSave,
  headerBg,
  unitKerjaId,
  isLoading = false,
  personilCount = 0,
}) {
  // Format rupiah
  const formatRupiah = (value) => {
    if (value === null || value === undefined || isNaN(value)) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  };

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
          <Icon as={FiSearch} color="purple.500" />
          Cari Template BPD
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody p={8}>
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel fontSize="lg" fontWeight="semibold" mb={3}>
                Cari Berdasarkan Nama Kota
              </FormLabel>
              <AsyncSelect
                loadOptions={async (inputValue) => {
                  if (!unitKerjaId) {
                    console.error("unitKerjaId is required");
                    return [];
                  }
                  try {
                    const res = await axios.get(
                      `${
                        import.meta.env.VITE_REACT_APP_API_BASE_URL
                      }/templateBPD/search?unitKerjaId=${unitKerjaId}`
                    );

                    const filtered = res.data.result;

                    // Filter berdasarkan inputValue jika ada
                    const results = inputValue
                      ? filtered.filter((val) =>
                          val.namaKota?.toLowerCase().includes(inputValue.toLowerCase())
                        )
                      : filtered;

                    return results.map((val) => ({
                      value: val.id,
                      label: `${val.namaKota} - ${val.daftarUnitKerja?.unitKerja || ""}`,
                      data: val,
                    }));
                  } catch (err) {
                    console.error("Failed to load options:", err.message);
                    return [];
                  }
                }}
                defaultOptions
                placeholder="Ketik nama kota untuk mencari..."
                onChange={(selectedOption) => {
                  setSelectedTemplateBPD(selectedOption || null);
                }}
                value={selectedTemplateBPD}
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
                    backgroundColor: useColorModeValue("white", "gray.700"),
                    border: "2px solid",
                    borderColor: useColorModeValue("gray.200", "gray.600"),
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
                    bg: state.isFocused ? "purple.500" : useColorModeValue("white", "gray.700"),
                    color: state.isFocused ? "white" : useColorModeValue("black", "white"),
                    _hover: { bg: "purple.500", color: "white" },
                  }),
                }}
              />
            </FormControl>

            {/* Preview data template yang dipilih */}
            {selectedTemplateBPD?.data && (
              <Box
                p={4}
                bg={useColorModeValue("gray.50", "gray.700")}
                borderRadius="lg"
                border="1px"
                borderColor={useColorModeValue("gray.200", "gray.600")}
              >
                <Text fontWeight="bold" mb={3}>
                  Detail Template BPD
                </Text>
                <VStack align="start" spacing={2}>
                  <HStack>
                    <Icon as={FiMapPin} color="purple.500" />
                    <Text>
                      <strong>Nama Kota:</strong>{" "}
                      {selectedTemplateBPD.data.namaKota}
                    </Text>
                  </HStack>
                  <HStack>
                    <Icon as={FiDollarSign} color="green.500" />
                    <Text>
                      <strong>Uang Harian:</strong>{" "}
                      {formatRupiah(selectedTemplateBPD.data.uangHarian)}
                    </Text>
                  </HStack>
                  <HStack>
                    <Text>
                      <strong>Status:</strong>
                    </Text>
                    <Badge
                      colorScheme={
                        selectedTemplateBPD.data.status === "aktif"
                          ? "green"
                          : "red"
                      }
                    >
                      {selectedTemplateBPD.data.status}
                    </Badge>
                  </HStack>
                  {selectedTemplateBPD.data.daftarUnitKerja && (
                    <HStack>
                      <Text>
                        <strong>Unit Kerja:</strong>{" "}
                        {selectedTemplateBPD.data.daftarUnitKerja.unitKerja}
                      </Text>
                    </HStack>
                  )}
                  {/* Template Rill */}
                  {(selectedTemplateBPD.data.templateRills ||
                    selectedTemplateBPD.data.templateRill) &&
                    (
                      selectedTemplateBPD.data.templateRills ||
                      selectedTemplateBPD.data.templateRill
                    ).length > 0 && (
                      <Box mt={2} w="100%">
                        <Text fontWeight="semibold" mb={2}>
                          Template Rill ({(selectedTemplateBPD.data.templateRills || selectedTemplateBPD.data.templateRill).length} item):
                        </Text>
                        <VStack align="start" spacing={1} pl={4}>
                          {(
                            selectedTemplateBPD.data.templateRills ||
                            selectedTemplateBPD.data.templateRill
                          ).map((rill, idx) => (
                            <Text key={rill.id} fontSize="sm">
                              {idx + 1}. {rill.uraian} - {formatRupiah(rill.nilai)}
                            </Text>
                          ))}
                        </VStack>
                      </Box>
                    )}

                  {/* Info personil yang akan diterapkan */}
                  {personilCount > 0 && (
                    <Box
                      mt={3}
                      p={3}
                      bg={useColorModeValue("blue.50", "blue.900")}
                      borderRadius="md"
                      border="1px"
                      borderColor="blue.200"
                    >
                      <Text fontSize="sm" color="blue.700">
                        Template ini akan diterapkan ke <strong>{personilCount} personil</strong>
                      </Text>
                    </Box>
                  )}
                </VStack>
              </Box>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter gap={3} p={8}>
          <Button
            variant="outline"
            onClick={onClose}
            _hover={{ transform: "translateY(-1px)" }}
            transition="all 0.2s"
            isDisabled={isLoading}
          >
            Batal
          </Button>
          <Button
            colorScheme="purple"
            leftIcon={<FiCheckCircle />}
            onClick={onSave}
            _hover={{ transform: "translateY(-1px)" }}
            transition="all 0.2s"
            isDisabled={!selectedTemplateBPD || isLoading}
            isLoading={isLoading}
            loadingText="Menerapkan..."
          >
            Terapkan Template
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default ModalSearchTemplateBPD;
