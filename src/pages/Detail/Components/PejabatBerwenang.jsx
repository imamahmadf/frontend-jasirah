import React from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  useColorModeValue,
  SimpleGrid,
  Icon,
} from "@chakra-ui/react";
import { FiCheckCircle, FiUser } from "react-icons/fi";

function PejabatBerwenang({ detailPerjalanan }) {
  const getInitials = (name) => {
    if (!name) return "??";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const officialsBg = useColorModeValue("rgba(248, 250, 252, 0.3)", "rgba(31, 41, 55, 0.3)");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  return (
    <Box p={6} bg={officialsBg}>
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
            cardBg={cardBg}
            borderColor={borderColor}
          />
        )}
        {detailPerjalanan.KPA?.pegawai_KPA && (
          <OfficialCard
            role="KPA"
            name={detailPerjalanan.KPA.pegawai_KPA.nama}
            nip={detailPerjalanan.KPA.pegawai_KPA.nip}
            position={detailPerjalanan.KPA.jabatan || "Pengguna Anggaran"}
            variant="blue"
            cardBg={cardBg}
            borderColor={borderColor}
          />
        )}
        {detailPerjalanan.bendahara?.pegawai_bendahara && (
          <OfficialCard
            role="BENDAHARA"
            name={detailPerjalanan.bendahara.pegawai_bendahara.nama}
            nip={detailPerjalanan.bendahara.pegawai_bendahara.nip}
            position={detailPerjalanan.bendahara.jabatan || "Bendahara Pengeluaran Pembantu"}
            variant="amber"
            cardBg={cardBg}
            borderColor={borderColor}
          />
        )}
      </SimpleGrid>
    </Box>
  );
}

// OfficialCard Component
function OfficialCard({ role, name, nip, position, variant, cardBg, borderColor }) {
  const getInitials = (name) => {
    if (!name) return "??";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

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
      borderColor={borderColor}
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
            borderTopColor="gray.100"
            pt={2}
          >
            {position || "-"}
          </Text>
        </VStack>
      </VStack>
    </Box>
  );
}

export default PejabatBerwenang;
