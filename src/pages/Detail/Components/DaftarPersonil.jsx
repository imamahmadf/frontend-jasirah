import React from "react";
import {
  Box,
  Heading,
  Icon,
  Flex,
  HStack,
  Button,
  SimpleGrid,
  Select,
  Wrap,
  WrapItem,
  Badge,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  FiUsers,
  FiCheckCircle,
  FiUserPlus,
  FiSearch,
  FiPrinter,
  FiZap,
} from "react-icons/fi";
import PersonilCard from "./PersonilCard";

function DaftarPersonil({
  detailPerjalanan,
  adaStatusDuaAtauTiga,
  semuaPersonilBelumAdaRincian,
  adaPersonilYangBisaDiajukan,
  adaPersonilYangBisaDicetak,
  keuangan,
  isSubmittingPengajuan,
  isCreatingAutoBulk,
  isPrintingAll,
  onPengajuanBulk,
  onBuatOtomatisBulk,
  onCetakSemuaKwitansi,
  onTambahPersonil,
  onEditPersonil,
  onHapusPersonil,
  onSearchTemplateBPD,
  dataTemplate,
  templateId,
  setTemplateId,
  cardBg,
  borderColor,
  headerBg,
}) {
  const jumlahPersonil = detailPerjalanan?.personils?.length || 0;

  const sectionBg = useColorModeValue("white", "gray.800");
  const borderCardColor = useColorModeValue("gray.200", "gray.600");

  return (
    <Box>
      {/* Section Header */}
      <Box
        bg={sectionBg}
        borderRadius="xl"
        p={4}
        shadow="sm"
        border="1px"
        borderColor={borderCardColor}
        mb={6}
      >
        <Flex
          direction={{ base: "column", sm: "row" }}
          justify="space-between"
          align={{ base: "start", sm: "center" }}
          gap={4}
        >
          <HStack spacing={3}>
            <Box
              p={2}
              bg="teal.100"
              color="teal.700"
              borderRadius="lg"
              shadow="sm"
            >
              <Icon as={FiUsers} boxSize={5} />
            </Box>
            <HStack spacing={3}>
              <Heading size="md" fontWeight="bold" color="gray.900">
                Daftar Personil
              </Heading>
              <Badge
                bg="teal.50"
                color="teal.700"
                border="1px"
                borderColor="teal.100"
                fontSize="xs"
                px={2.5}
                py={0.5}
                borderRadius="full"
                fontWeight="bold"
                shadow="sm"
              >
                {jumlahPersonil} ORANG
              </Badge>
            </HStack>
          </HStack>

          {/* Action Buttons */}
          <Wrap spacing={2} justify={{ base: "start", sm: "flex-end" }}>
            {/* Tombol Ajukan Semua */}
            {adaPersonilYangBisaDiajukan && (
              <WrapItem>
                <Button
                  leftIcon={<FiCheckCircle />}
                  colorScheme="green"
                  onClick={onPengajuanBulk}
                  isLoading={isSubmittingPengajuan}
                  loadingText="Mengajukan..."
                  size="sm"
                  transition="all 0.2s"
                  shadow="sm"
                  _hover={{ shadow: "md" }}
                  _active={{ transform: "scale(0.95)" }}
                >
                  Ajukan Semua
                </Button>
              </WrapItem>
            )}

            {/* Tombol Buat Otomatis */}
            {!adaStatusDuaAtauTiga &&
              semuaPersonilBelumAdaRincian &&
              detailPerjalanan.jenisPerjalanan?.tipePerjalananId === 1 && (
                <WrapItem>
                  <Button
                    leftIcon={<FiZap />}
                    colorScheme="green"
                    onClick={onBuatOtomatisBulk}
                    isLoading={isCreatingAutoBulk}
                    loadingText="Membuat..."
                    size="sm"
                    transition="all 0.2s"
                    shadow="sm"
                    _hover={{ shadow: "md" }}
                    _active={{ transform: "scale(0.95)" }}
                  >
                    Buat Otomatis
                  </Button>
                </WrapItem>
              )}

            {/* Tombol Cari Template BPD */}
            {onSearchTemplateBPD &&
              !adaStatusDuaAtauTiga &&
              semuaPersonilBelumAdaRincian &&
              detailPerjalanan.jenisPerjalanan?.tipePerjalananId !== 1 && (
                <WrapItem>
                  <Button
                    leftIcon={<FiSearch />}
                    colorScheme="purple"
                    onClick={onSearchTemplateBPD}
                    size="sm"
                    transition="all 0.2s"
                  >
                    Cari Template BPD
                  </Button>
                </WrapItem>
              )}

            {/* Tombol Tambah Personil */}
            {!adaStatusDuaAtauTiga && jumlahPersonil < 5 && (
              <WrapItem>
                <Button
                  leftIcon={<FiUserPlus />}
                  bg="white"
                  color="gray.700"
                  border="1px"
                  borderColor="gray.200"
                  _hover={{ bg: "gray.50", borderColor: "gray.300" }}
                  onClick={onTambahPersonil}
                  size="sm"
                  transition="all 0.2s"
                  shadow="sm"
                >
                  Tambah Personil
                </Button>
              </WrapItem>
            )}

            {/* Group Cetak Kwitansi - selalu tampil jika keuangan nonaktif */}
            {onCetakSemuaKwitansi && (keuangan === "nonaktif" || adaPersonilYangBisaDicetak) && (
              <WrapItem>
                <HStack spacing={2}>
                  <Select
                    size="sm"
                    bg="white"
                    borderRadius="md"
                    borderColor="gray.300"
                    w={{ base: "130px", md: "170px" }}
                    value={templateId || ""}
                    onChange={(e) => setTemplateId(e.target.value)}
                    _focus={{
                      borderColor: "blue.400",
                      boxShadow: "outline",
                    }}
                    fontSize="sm"
                  >
                    {dataTemplate?.map((val) => (
                      <option key={val.id} value={val.id}>
                        {val.nama}
                      </option>
                    ))}
                  </Select>
                  <Button
                    leftIcon={<FiPrinter />}
                    colorScheme="blue"
                    onClick={() => onCetakSemuaKwitansi(templateId)}
                    isLoading={isPrintingAll}
                    loadingText="Mencetak..."
                    size="sm"
                    transition="all 0.2s"
                  >
                    Cetak Semua
                  </Button>
                </HStack>
              </WrapItem>
            )}
          </Wrap>
        </Flex>
      </Box>

      {/* Cards Grid */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        {detailPerjalanan?.personils?.map((item, index) => (
          <PersonilCard
            key={index}
            item={item}
            index={index}
            detailPerjalanan={detailPerjalanan}
            onEditClick={onEditPersonil}
            onHapusClick={onHapusPersonil}
            borderColor={borderColor}
          />
        ))}
      </SimpleGrid>
    </Box>
  );
}

export default DaftarPersonil;
