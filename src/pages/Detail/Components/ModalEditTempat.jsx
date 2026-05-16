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
  Input,
  Select,
  VStack,
  Box,
  Text,
  Icon,
  SimpleGrid,
  useColorModeValue,
} from "@chakra-ui/react";
import { FiEdit3, FiCheckCircle } from "react-icons/fi";

function ModalEditTempat({
  isOpen,
  onClose,
  detailPerjalanan,
  selectedTempatIndex,
  editTanggalBerangkat,
  setEditTanggalBerangkat,
  editTanggalPulang,
  setEditTanggalPulang,
  editTujuan,
  setEditTujuan,
  editDalamKotaId,
  setEditDalamKotaId,
  dataDalamKota,
  onSave,
  borderColor,
  headerBg,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
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
          Edit Tempat
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody p={8}>
          <VStack spacing={6} align="stretch">
            <Box
              bg={useColorModeValue("gray.50", "gray.700")}
              p={4}
              borderRadius="lg"
              border="1px"
              borderColor={borderColor}
            >
              <Text
                fontSize="sm"
                fontWeight="semibold"
                color="gray.600"
                mb={2}
              >
                Tempat yang diedit:
              </Text>
              <Text fontSize="lg" fontWeight="medium">
                {detailPerjalanan?.tempats?.[selectedTempatIndex] &&
                detailPerjalanan.jenisPerjalanan?.tipePerjalananId === 1
                  ? detailPerjalanan.tempats[selectedTempatIndex].dalamKota
                      ?.nama
                  : detailPerjalanan.tempats[selectedTempatIndex].tempat}
              </Text>
            </Box>

            <SimpleGrid columns={2} spacing={4}>
              <FormControl>
                <FormLabel fontSize="md" fontWeight="semibold">
                  Tanggal Berangkat
                </FormLabel>
                <Input
                  type="date"
                  value={editTanggalBerangkat}
                  onChange={(e) => setEditTanggalBerangkat(e.target.value)}
                  borderRadius="lg"
                  border="2px solid"
                  borderColor="gray.200"
                  _hover={{ borderColor: "purple.300" }}
                  _focus={{
                    borderColor: "purple.500",
                    boxShadow: "0 0 0 1px purple.500",
                  }}
                  height="45px"
                />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="md" fontWeight="semibold">
                  Tanggal Pulang
                </FormLabel>
                <Input
                  type="date"
                  value={editTanggalPulang}
                  onChange={(e) => setEditTanggalPulang(e.target.value)}
                  borderRadius="lg"
                  border="2px solid"
                  borderColor="gray.200"
                  _hover={{ borderColor: "purple.300" }}
                  _focus={{
                    borderColor: "purple.500",
                    boxShadow: "0 0 0 1px purple.500",
                  }}
                  height="45px"
                />
              </FormControl>
            </SimpleGrid>

            <FormControl>
              <FormLabel fontSize="md" fontWeight="semibold">
                {detailPerjalanan.jenisPerjalanan?.tipePerjalananId === 1
                  ? "Lokasi Dalam Kota"
                  : "Tujuan"}
              </FormLabel>
              {detailPerjalanan.jenisPerjalanan?.tipePerjalananId === 1 ? (
                <Select
                  placeholder="Pilih lokasi dalam kota..."
                  value={editDalamKotaId}
                  onChange={(e) => setEditDalamKotaId(e.target.value)}
                  borderRadius="lg"
                  border="2px solid"
                  borderColor="gray.200"
                  _hover={{ borderColor: "purple.300" }}
                  _focus={{
                    borderColor: "purple.500",
                    boxShadow: "0 0 0 1px purple.500",
                  }}
                  height="45px"
                >
                  {dataDalamKota &&
                    dataDalamKota.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.nama}
                      </option>
                    ))}
                </Select>
              ) : (
                <Input
                  type="text"
                  value={editTujuan}
                  onChange={(e) => setEditTujuan(e.target.value)}
                  placeholder="Masukkan tujuan..."
                  borderRadius="lg"
                  border="2px solid"
                  borderColor="gray.200"
                  _hover={{ borderColor: "purple.300" }}
                  _focus={{
                    borderColor: "purple.500",
                    boxShadow: "0 0 0 1px purple.500",
                  }}
                  height="45px"
                />
              )}
            </FormControl>
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
            leftIcon={<FiCheckCircle />}
            onClick={onSave}
            _hover={{ transform: "translateY(-1px)" }}
            transition="all 0.2s"
            isDisabled={
              !editTanggalBerangkat ||
              !editTanggalPulang ||
              (detailPerjalanan.jenisPerjalanan?.tipePerjalananId === 1
                ? !editDalamKotaId
                : !editTujuan)
            }
          >
            Simpan Perubahan
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default ModalEditTempat;
