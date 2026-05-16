import React from "react";
import {
  Card,
  CardBody,
  Heading,
  Icon,
  VStack,
  HStack,
  Text,
  Box,
  Button,
  useColorModeValue,
  Badge,
  Flex,
  SimpleGrid,
  Divider,
} from "@chakra-ui/react";
import {
  FiMapPin,
  FiFileText,
  FiCalendar,
  FiDollarSign,
  FiEdit3,
  FiExternalLink,
  FiClock,
  FiCheckCircle,
  FiUser,
} from "react-icons/fi";
import { useHistory } from "react-router-dom";

function InformasiPerjalanan({
  detailPerjalanan,
  adaStatusDuaAtauTiga,
  onEditTempatClick,
  onEditNomorSuratClick,
  onEditSubKegiatanClick,
  formatDateForInput,
  cardBg,
  borderColor,
  headerBg,
}) {
  const history = useHistory();
  const kwitGlobalId = detailPerjalanan?.kwitGlobalId;

  const handleGoToKwitGlobal = () => {
    if (kwitGlobalId) {
      history.push(`/perjalanan/detail-kwitansi-global/${kwitGlobalId}`);
    }
  };

  // Tentukan progress step berdasarkan status
  const getProgressStep = () => {
    const statusIds = detailPerjalanan?.personils?.map((p) => p.statusId) || [];
    if (statusIds.includes(3)) return 3; // Selesai
    if (statusIds.includes(2)) return 2; // Disetujui
    return 1; // Pengajuan
  };

  const currentStep = getProgressStep();

  const sectionBg = useColorModeValue("white", "gray.800");
  const headerSectionBg = useColorModeValue("rgba(248, 250, 252, 0.5)", "rgba(31, 41, 55, 0.5)");
  const labelColor = useColorModeValue("gray.500", "gray.400");
  const borderCardColor = useColorModeValue("gray.200", "gray.600");
  const subKegiatanBg = useColorModeValue("gray.50", "gray.700");

  // InfoItem Component
  const InfoItem = ({ label, value, isMono = false, highlight = false, customValue }) => (
    <VStack align="start" spacing={1.5}>
      <Text
        fontSize="10px"
        fontWeight="bold"
        color={labelColor}
        textTransform="uppercase"
        letterSpacing="wider"
      >
        {label}
      </Text>
      {customValue ? (
        customValue
      ) : (
        <Text
          fontSize={isMono ? "xs" : "sm"}
          fontWeight="medium"
          fontFamily={isMono ? "mono" : "inherit"}
          color={isMono ? "gray.700" : "gray.900"}
          bg={highlight ? "teal.50" : "transparent"}
          px={highlight ? 2 : 0}
          py={highlight ? 0.5 : 0}
          borderRadius="md"
          border={highlight ? "1px" : "none"}
          borderColor={highlight ? "teal.100" : "transparent"}
          display={highlight ? "inline-block" : "block"}
          w={highlight ? "fit-content" : "auto"}
        >
          {value}
        </Text>
      )}
    </VStack>
  );

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
      {/* Header with Status Timeline */}
      <Box p={6} borderBottom="1px" borderColor={borderCardColor} bg={headerSectionBg}>
        <Flex
          direction={{ base: "column", sm: "row" }}
          align={{ base: "start", sm: "center" }}
          justify="space-between"
          gap={4}
          mb={6}
        >
          <HStack spacing={3}>
            <Box p={2} bg="teal.100" color="teal.700" borderRadius="lg" shadow="sm">
              <Icon as={FiFileText} boxSize={5} />
            </Box>
            <Heading size="md" fontWeight="semibold" color="gray.900">
              Informasi Perjalanan
            </Heading>
          </HStack>

          {/* Timeline Status */}
          <HStack spacing={2} fontSize="xs" fontWeight="medium">
            <HStack
              spacing={1.5}
              color={currentStep >= 1 ? "teal.700" : "gray.400"}
              bg={currentStep >= 1 ? "teal.50" : "transparent"}
              px={2}
              py={1}
              borderRadius="md"
              border={currentStep >= 1 ? "1px" : "none"}
              borderColor={currentStep >= 1 ? "teal.100" : "transparent"}
            >
              <Box
                w="8px"
                h="8px"
                borderRadius="full"
                bg={currentStep >= 1 ? "teal.500" : "gray.300"}
                animation={currentStep >= 1 ? "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" : "none"}
              />
              <Text>Pengajuan</Text>
            </HStack>
            <Box w="16px" h="1px" bg="gray.300" />
            <HStack spacing={1.5} color="gray.400">
              <Box
                w="8px"
                h="8px"
                borderRadius="full"
                bg={currentStep >= 2 ? "teal.500" : "gray.300"}
              />
              <Text>Disetujui</Text>
            </HStack>
            <Box w="16px" h="1px" bg="gray.300" />
            <HStack spacing={1.5} color="gray.400">
              <Box
                w="8px"
                h="8px"
                borderRadius="full"
                bg={currentStep >= 3 ? "teal.500" : "gray.300"}
              />
              <Text>Selesai</Text>
            </HStack>
          </HStack>
        </Flex>

        {/* Main Info Grid */}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          {/* Left Column: Basic Info */}
          <VStack spacing={6} align="stretch">
            {/* Lokasi & Tujuan Card */}
            <Box bg={sectionBg} p={4} borderRadius="lg" border="1px" borderColor={borderCardColor} shadow="sm">
              <HStack spacing={2} mb={3}>
                <Icon as={FiMapPin} boxSize={3} color={labelColor} />
                <Text
                  fontSize="xs"
                  fontWeight="bold"
                  color={labelColor}
                  textTransform="uppercase"
                  letterSpacing="wider"
                >
                  Lokasi & Tujuan
                </Text>
              </HStack>
              <VStack spacing={4} align="stretch">
                <InfoItem label="ASAL" value={detailPerjalanan.asal || "-"} />

                <Box pt={2} borderTop="1px" borderColor="gray.50">
                  <Text fontSize="xs" fontWeight="medium" color="gray.500" mb={1}>
                    TUJUAN ({detailPerjalanan?.tempats?.length || 0} TEMPAT)
                  </Text>
                  <VStack spacing={3} align="stretch">
                    {detailPerjalanan?.tempats?.map((tempat, index) => (
                      <Box
                        key={tempat?.id ?? index}
                        bg="gray.50"
                        borderRadius="lg"
                        p={3}
                        border="1px"
                        borderColor={borderCardColor}
                      >
                        <HStack align="start" spacing={3}>
                          <Icon
                            as={FiMapPin}
                            color="red.500"
                            boxSize={4}
                            mt={0.5}
                            flexShrink={0}
                          />
                          <VStack align="start" spacing={1.5} flex={1}>
                            <HStack justify="space-between" w="full" flexWrap="wrap" gap={2}>
                              <Text fontSize="sm" fontWeight="bold" color="gray.900">
                                {detailPerjalanan.jenisPerjalanan?.tipePerjalananId === 1
                                  ? (tempat.dalamKota?.nama || "-")
                                  : (tempat.tempat || "-")}
                              </Text>
                              {!adaStatusDuaAtauTiga && (
                                <Button
                                  size="xs"
                                  leftIcon={<FiEdit3 />}
                                  colorScheme="purple"
                                  variant="ghost"
                                  onClick={() => onEditTempatClick(tempat, index)}
                                >
                                  Edit
                                </Button>
                              )}
                            </HStack>
                            <HStack spacing={3} flexWrap="wrap" fontSize="xs" color="gray.500">
                              <HStack
                                spacing={1}
                                bg="white"
                                px={1.5}
                                py={0.5}
                                borderRadius="md"
                                border="1px"
                                borderColor={borderCardColor}
                              >
                                <Icon as={FiCalendar} boxSize={2.5} />
                                <Text>
                                  Pergi:{" "}
                                  {tempat.tanggalBerangkat
                                    ? new Date(tempat.tanggalBerangkat).toLocaleDateString("id-ID", {
                                        day: "numeric",
                                        month: "numeric",
                                        year: "numeric",
                                      })
                                    : "-"}
                                </Text>
                              </HStack>
                              <HStack
                                spacing={1}
                                bg="white"
                                px={1.5}
                                py={0.5}
                                borderRadius="md"
                                border="1px"
                                borderColor={borderCardColor}
                              >
                                <Icon as={FiCalendar} boxSize={2.5} />
                                <Text>
                                  Pulang:{" "}
                                  {tempat.tanggalPulang
                                    ? new Date(tempat.tanggalPulang).toLocaleDateString("id-ID", {
                                        day: "numeric",
                                        month: "numeric",
                                        year: "numeric",
                                      })
                                    : "-"}
                                </Text>
                              </HStack>
                            </HStack>
                          </VStack>
                        </HStack>
                      </Box>
                    ))}
                  </VStack>
                </Box>
              </VStack>
            </Box>

            {/* Waktu & Dana Card */}
            <Box bg={sectionBg} p={4} borderRadius="lg" border="1px" borderColor={borderCardColor} shadow="sm">
              <HStack spacing={2} mb={3}>
                <Icon as={FiClock} boxSize={3} color={labelColor} />
                <Text
                  fontSize="xs"
                  fontWeight="bold"
                  color={labelColor}
                  textTransform="uppercase"
                  letterSpacing="wider"
                >
                  Waktu & Dana
                </Text>
              </HStack>
              <SimpleGrid columns={2} spacing={4}>
                <InfoItem
                  label="TANGGAL PENGAJUAN"
                  value={
                    detailPerjalanan.tanggalPengajuan
                      ? new Date(detailPerjalanan.tanggalPengajuan).toLocaleDateString("id-ID", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "-"
                  }
                />
                <InfoItem
                  label="SUMBER DANA"
                  value={detailPerjalanan.bendahara?.sumberDana?.sumber || "-"}
                  highlight
                />
              </SimpleGrid>
            </Box>
          </VStack>

          {/* Right Column: Documents & Details */}
          <VStack spacing={6} align="stretch">
            <Box
              bg={sectionBg}
              p={4}
              borderRadius="lg"
              border="1px"
              borderColor={borderCardColor}
              shadow="sm"
              h="100%"
            >
              <Flex justify="space-between" align="center" mb={3}>
                <HStack spacing={2}>
                  <Icon as={FiFileText} boxSize={3} color={labelColor} />
                  <Text
                    fontSize="xs"
                    fontWeight="bold"
                    color={labelColor}
                    textTransform="uppercase"
                    letterSpacing="wider"
                  >
                    Dokumen Referensi
                  </Text>
                </HStack>
                {!adaStatusDuaAtauTiga && onEditNomorSuratClick && (
                  <Button
                    size="xs"
                    leftIcon={<FiEdit3 />}
                    colorScheme="purple"
                    variant="outline"
                    onClick={onEditNomorSuratClick}
                    _hover={{ transform: "translateY(-1px)" }}
                    transition="all 0.2s"
                  >
                    Edit nomor surat
                  </Button>
                )}
              </Flex>
              <VStack spacing={4} align="stretch">
                <InfoItem label="DASAR" value={detailPerjalanan.dasar || "-"} />
                <InfoItem
                  label="NO. SURAT TUGAS"
                  value={detailPerjalanan.noSuratTugas || "-"}
                  isMono
                />
                <InfoItem
                  label="NO. NOTA DINAS"
                  value={
                    detailPerjalanan.isNotaDinas == 1
                      ? (detailPerjalanan.noNotaDinas || "-")
                      : "-"
                  }
                  isMono
                />
                <InfoItem
                  label="NO. TELAAHAN STAF"
                  value={
                    detailPerjalanan.isNotaDinas
                      ? "-"
                      : (detailPerjalanan.noNotaDinas || "-")
                  }
                />
                <Box pt={3} borderTop="1px" borderColor="gray.50">
                  <InfoItem
                    label="UNTUK"
                    value={detailPerjalanan.untuk || "-"}
                    customValue={
                      <HStack spacing={2}>
                        <Box position="relative" w="10px" h="10px">
                          <Box
                            position="absolute"
                            w="full"
                            h="full"
                            borderRadius="full"
                            bg="green.400"
                            opacity={0.75}
                            animation="ping 1s cubic-bezier(0, 0, 0.2, 1) infinite"
                          />
                          <Box
                            position="relative"
                            w="full"
                            h="full"
                            borderRadius="full"
                            bg="green.500"
                          />
                        </Box>
                        <Text fontSize="sm" fontWeight="medium" color="gray.900">
                          {detailPerjalanan.untuk || "-"}
                        </Text>
                      </HStack>
                    }
                  />
                </Box>
              </VStack>
            </Box>
          </VStack>
        </SimpleGrid>
      </Box>

      {/* Sub Kegiatan Bar */}
      <Box px={6} py={4} bg={subKegiatanBg} borderBottom="1px" borderColor={borderCardColor}>
        <HStack spacing={3} flexWrap="wrap">
          <Text
            fontSize="xs"
            fontWeight="bold"
            color="gray.500"
            textTransform="uppercase"
            letterSpacing="wider"
            flexShrink={0}
          >
            SUB KEGIATAN
          </Text>
          <Box h="16px" w="1px" bg="gray.300" />
          <HStack spacing={2} flex={1}>
            <Box
              w="8px"
              h="8px"
              borderRadius="full"
              bg="purple.500"
              shadow="sm"
              boxShadow="0 0 0 2px rgba(168, 85, 247, 0.2)"
            />
            <Text fontSize="sm" fontWeight="medium" color="gray.900" flex={1}>
              {detailPerjalanan?.daftarSubKegiatan?.subKegiatan || "-"}
            </Text>
          </HStack>
          {!adaStatusDuaAtauTiga && onEditSubKegiatanClick && (
            <Button
              size="sm"
              leftIcon={<FiEdit3 />}
              colorScheme="purple"
              variant="outline"
              onClick={onEditSubKegiatanClick}
              _hover={{ transform: "translateY(-1px)" }}
              transition="all 0.2s"
            >
              Edit
            </Button>
          )}
        </HStack>
      </Box>

      {/* Officials Section */}
      <Box p={6} bg={useColorModeValue("rgba(248, 250, 252, 0.3)", "rgba(31, 41, 55, 0.3)")}>
        <HStack spacing={2} mb={4}>
          <Icon as={FiCheckCircle} boxSize={4} color="teal.600" />
          <Text fontSize="sm" fontWeight="semibold" color="gray.900">
            Pejabat Berwenang
          </Text>
        </HStack>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          {/* OfficialCard Component */}
          {detailPerjalanan.PPTK?.pegawai_PPTK && (
            <OfficialCard
              role="PPTK"
              name={detailPerjalanan.PPTK.pegawai_PPTK.nama}
              nip={detailPerjalanan.PPTK.pegawai_PPTK.nip}
              position={detailPerjalanan.PPTK.jabatan || "Pejabat Pelaksana Teknis Kegiatan (PPTK)"}
              variant="teal"
            />
          )}
          {detailPerjalanan.KPA?.pegawai_KPA && (
            <OfficialCard
              role="KPA"
              name={detailPerjalanan.KPA.pegawai_KPA.nama}
              nip={detailPerjalanan.KPA.pegawai_KPA.nip}
              position={detailPerjalanan.KPA.jabatan || "Pengguna Anggaran"}
              variant="blue"
            />
          )}
          {detailPerjalanan.bendahara?.pegawai_bendahara && (
            <OfficialCard
              role="BENDAHARA"
              name={detailPerjalanan.bendahara.pegawai_bendahara.nama}
              nip={detailPerjalanan.bendahara.pegawai_bendahara.nip}
              position={detailPerjalanan.bendahara.jabatan || "Bendahara Pengeluaran Pembantu"}
              variant="amber"
            />
          )}
        </SimpleGrid>
      </Box>
    </Card>
  );
}

// OfficialCard Component
function OfficialCard({ role, name, nip, position, variant }) {
  const getInitials = (name) => {
    if (!name) return "??";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const cardBg = useColorModeValue("white", "gray.800");
  const borderCardColor = useColorModeValue("gray.200", "gray.600");

  const variantColors = {
    teal: {
      border: "teal.500",
      bg: "rgba(240, 253, 250, 0.3)",
      text: "teal.700",
      badge: "teal.100",
      badgeText: "teal.800",
      circle: "teal.100",
      circleText: "teal.700",
    },
    blue: {
      border: "blue.500",
      bg: "rgba(239, 246, 255, 0.3)",
      text: "blue.700",
      badge: "blue.100",
      badgeText: "blue.800",
      circle: "blue.100",
      circleText: "blue.700",
    },
    amber: {
      border: "amber.500",
      bg: "rgba(255, 251, 235, 0.3)",
      text: "amber.700",
      badge: "amber.100",
      badgeText: "amber.800",
      circle: "amber.100",
      circleText: "amber.700",
    },
  };

  const colors = variantColors[variant] || variantColors.teal;

  return (
    <Box
      bg={cardBg}
      p={5}
      borderRadius="xl"
      borderLeft="4px"
      borderLeftColor={colors.border}
      border="1px"
      borderColor={borderCardColor}
      shadow="sm"
      h="100%"
      transition="all 0.2s"
      _hover={{
        shadow: "md",
      }}
    >
      <VStack align="start" spacing={3}>
        <HStack justify="space-between" w="full" align="start">
          <Box
            w="32px"
            h="32px"
            borderRadius="full"
            bg={colors.circle}
            display="flex"
            alignItems="center"
            justifyContent="center"
            color={colors.circleText}
            fontWeight="bold"
            fontSize="xs"
            flexShrink={0}
            ring="2px"
            ringColor="white"
            shadow="sm"
          >
            {getInitials(name)}
          </Box>
          <Badge
            bg={colors.badge}
            color={colors.badgeText}
            fontSize="10px"
            fontWeight="bold"
            textTransform="uppercase"
            letterSpacing="wider"
            px={2.5}
            py={1}
            borderRadius="full"
          >
            {role}
          </Badge>
        </HStack>
        <VStack align="start" spacing={1} w="full">
          <Text
            fontSize="sm"
            fontWeight="bold"
            color="gray.900"
            noOfLines={1}
            _groupHover={{ color: "teal.700" }}
            transition="colors 0.2s"
          >
            {name || "-"}
          </Text>
          <HStack spacing={1.5} fontSize="xs" color="gray.500" mt={1}>
            <Icon as={FiUser} boxSize={3} color="gray.400" />
            <Text fontFamily="mono">NIP: {nip || "-"}</Text>
          </HStack>
          <Text
            fontSize="xs"
            color="gray.600"
            lineHeight="relaxed"
            mt={2}
            borderTop="1px"
            borderTopColor={useColorModeValue("gray.200", "gray.600")}
            pt={2}
          >
            {position || "-"}
          </Text>
        </VStack>
      </VStack>
    </Box>
  );
}

export default InformasiPerjalanan;
