import React from "react";
import {
  Card,
  CardBody,
  Heading,
  Icon,
  Text,
  Box,
  HStack,
  VStack,
  useColorModeValue,
  Divider,
} from "@chakra-ui/react";
import { FiCamera, FiTruck, FiAlertCircle } from "react-icons/fi";
import TambahBuktiKegiatan from "../../../Componets/TambahBuktiKegiatan";

function BuktiKegiatan({
  detailPerjalanan,
  setRandomNumber,
  cardBg,
  borderColor,
  headerBg,
}) {
  const sectionBg = useColorModeValue("white", "gray.800");
  const headerSectionBg = useColorModeValue("rgba(248, 250, 252, 0.5)", "rgba(31, 41, 55, 0.5)");
  const borderCardColor = useColorModeValue("gray.200", "gray.600");

  return (
    <Card
      bg={cardBg}
      border="1px"
      borderColor={borderCardColor}
      shadow="sm"
      borderRadius="xl"
      overflow="hidden"
      h="100%"
      display="flex"
      flexDirection="column"
    >
      {/* Header */}
      <Box
        p={6}
        borderBottom="1px"
        borderColor={borderCardColor}
        bg={headerSectionBg}
      >
        <HStack spacing={3}>
          <Box p={2} bg="teal.100" color="teal.700" borderRadius="lg" shadow="sm">
            <Icon as={FiCamera} boxSize={5} />
          </Box>
          <Heading size="md" fontWeight="semibold" color="gray.900">
            Bukti Kegiatan
          </Heading>
        </HStack>
      </Box>

      {/* Body */}
      <CardBody p={6} flex={1} display="flex" flexDirection="column" gap={6}>
        {/* Photo Section */}
        <Box flex={1} minH="240px">
          <TambahBuktiKegiatan
            fotoPerjalanan={detailPerjalanan?.fotoPerjalanans || []}
            id={detailPerjalanan?.id}
            status={detailPerjalanan?.personils?.[0]?.statusId || 1}
            randomNumber={setRandomNumber}
          />
        </Box>

        <Divider borderColor={borderCardColor} />

        {/* Vehicle Section */}
        <Box>
          <HStack spacing={2} mb={3}>
            <Icon as={FiTruck} boxSize={4} color="teal.600" />
            <Text fontSize="sm" fontWeight="semibold" color="gray.900">
              Kendaraan Dinas
            </Text>
          </HStack>

          <Box
            bg={useColorModeValue("gray.50", "gray.700")}
            borderRadius="xl"
            border="1px"
            borderColor={borderCardColor}
            p={6}
            textAlign="center"
            position="relative"
            overflow="hidden"
            transition="all 0.2s"
            _hover={{
              borderColor: "gray.300",
            }}
          >
            {/* Background pattern */}
            <Box
              position="absolute"
              top={0}
              right={0}
              p={4}
              opacity={0.05}
              zIndex={0}
            >
              <Icon as={FiTruck} boxSize={20} color="gray.400" />
            </Box>

            <VStack spacing={3} position="relative" zIndex={1}>
              <Box
                w="56px"
                h="56px"
                bg="white"
                borderRadius="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
                mb={3}
                shadow="sm"
                border="1px"
                borderColor={borderCardColor}
                transition="transform 0.2s"
                _groupHover={{
                  transform: "scale(1.05)",
                }}
              >
                <Box position="relative">
                  <Icon as={FiTruck} boxSize={6} color="gray.300" />
                  <Box
                    position="absolute"
                    top="-4px"
                    right="-4px"
                    bg={useColorModeValue("gray.200", "gray.600")}
                    borderRadius="full"
                    p={0.5}
                    border="1px"
                    borderColor="white"
                  >
                    <Icon as={FiAlertCircle} boxSize={2.5} color="gray.400" />
                  </Box>
                </Box>
              </Box>

              {detailPerjalanan?.kendaraanDina ? (
                <>
                  <Text fontSize="sm" fontWeight="bold" color="gray.700" mb={1}>
                    Menggunakan Kendaraan Dinas
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    {detailPerjalanan.kendaraanDina.kendaraan?.merek || "-"} - KT{" "}
                    {detailPerjalanan.kendaraanDina.kendaraan?.nomor || "-"}{" "}
                    {detailPerjalanan.kendaraanDina.kendaraan?.seri || ""}
                  </Text>
                </>
              ) : (
                <>
                  <Text fontSize="sm" fontWeight="bold" color="gray.700" mb={1}>
                    Tidak Menggunakan Kendaraan Dinas
                  </Text>
                  <Text
                    fontSize="xs"
                    color="gray.500"
                    maxW="200px"
                    mx="auto"
                    lineHeight="relaxed"
                  >
                    Perjalanan ini tercatat tidak menggunakan fasilitas kendaraan
                    dinas.
                  </Text>
                </>
              )}
            </VStack>
          </Box>
        </Box>
      </CardBody>
    </Card>
  );
}

export default BuktiKegiatan;
