import React from "react";
import {
  Card,
  VStack,
  HStack,
  Text,
  Badge,
  Box,
  Button,
  Icon,
  useColorModeValue,
  Divider,
} from "@chakra-ui/react";
import {
  FiCheckCircle,
  FiEdit3,
  FiTrash2,
  FiFileText,
  FiDollarSign,
} from "react-icons/fi";
import { useHistory } from "react-router-dom";

function PersonilCard({
  item,
  index,
  detailPerjalanan,
  onEditClick,
  onHapusClick,
  borderColor,
}) {
  const history = useHistory();

  const getInitials = (name) => {
    if (!name) return "??";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Warna berdasarkan statusId
  const getStatusStyle = (statusId) => {
    switch (statusId) {
      case 1: // Diproses/Pengajuan
        return {
          bg: "gray.100",
          text: "gray.700",
          border: "gray.800",
          ring: "gray.200",
        };
      case 2: // Disetujui
        return {
          bg: "purple.100",
          text: "purple.700",
          border: "purple.500",
          ring: "purple.200",
        };
      case 3: // Selesai
        return {
          bg: "green.100",
          text: "green.700",
          border: "green.500",
          ring: "green.200",
        };
      case 4: // Error/Gagal
        return {
          bg: "red.100",
          text: "red.700",
          border: "red.500",
          ring: "red.200",
        };
      default:
        return {
          bg: "blue.100",
          text: "blue.700",
          border: "blue.500",
          ring: "blue.200",
        };
    }
  };

  // Teks status berdasarkan statusId
  const getStatusText = (statusId) => {
    switch (statusId) {
      case 1:
        return "SPD dan Surat Tugas Sudah dibuat";
      case 2:
        return "Pengajuan kuitansi";
      case 3:
        return "Kwitansi tervierifikasi";
      case 4:
        return "Kwitansi ditolak";
      case 5:
        return "Selesai";
      default:
        return "Status tidak diketahui";
    }
  };

  // Warna badge berdasarkan statusId
  const getStatusBadgeColor = (statusId) => {
    switch (statusId) {
      case 1:
        return { bg: "gray.900", color: "white" };
      case 2:
        return { bg: "blue.600", color: "white" };
      case 3:
        return { bg: "green.600", color: "white" };
      case 4:
        return { bg: "red.600", color: "white" };
      case 5:
        return { bg: "purple.600", color: "white" };
      default:
        return { bg: "gray.600", color: "white" };
    }
  };

  // Warna avatar tetap berdasarkan index untuk variasi visual
  const avatarStyles = [
    { bg: "green.100", text: "green.700", ring: "green.200" },
    { bg: "purple.100", text: "purple.700", ring: "purple.200" },
    { bg: "blue.100", text: "blue.700", ring: "blue.200" },
    { bg: "orange.100", text: "orange.700", ring: "orange.200" },
    { bg: "pink.100", text: "pink.700", ring: "pink.200" },
  ];
  const avatarStyle = avatarStyles[index % avatarStyles.length];
  
  // Warna card berdasarkan status
  const statusStyle = getStatusStyle(item.statusId);

  const cardBg = useColorModeValue("white", "gray.800");
  const sectionBg = useColorModeValue("gray.50", "gray.700");
  const headerBg = useColorModeValue("gray.50", "gray.700");
  const borderCardColor = useColorModeValue("gray.200", "gray.600");

  // Hitung total biaya
  const totalBiaya = item.rincianBPDs?.reduce(
    (sum, rincian) => sum + rincian.qty * rincian.nilai,
    0
  ) || 0;

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card
      key={index}
      bg={cardBg}
      border="1px"
      borderColor={borderCardColor}
      borderTop="4px"
      borderTopColor={statusStyle.border}
      borderRadius="xl"
      p={6}
      shadow="sm"
      transition="all 0.2s"
      _hover={{
        shadow: "md",
      }}
    >
      <VStack spacing={4} align="stretch">
        {/* Header Personil */}
        <HStack spacing={4} align="start">
          <Box
            w="48px"
            h="48px"
            borderRadius="full"
            bg={avatarStyle.bg}
            display="flex"
            alignItems="center"
            justifyContent="center"
            color={avatarStyle.text}
            fontWeight="bold"
            fontSize="lg"
            flexShrink={0}
            ring="4px"
            ringColor={`${avatarStyle.ring}50`}
            shadow="sm"
          >
            {getInitials(item.pegawai.nama)}
          </Box>
          <VStack align="start" spacing={2} flex={1} minW={0}>
            <Text
              fontSize="md"
              fontWeight="bold"
              color="gray.900"
              noOfLines={1}
            >
              {item.pegawai.nama}
            </Text>
            <HStack
              spacing={1.5}
              align="center"
              bg="gray.50"
              px={2}
              py={0.5}
              borderRadius="md"
              border="1px"
              borderColor="gray.100"
              w="fit-content"
            >
              <Icon as={FiFileText} boxSize={2.5} color="gray.500" />
              <Text fontSize="xs" color="gray.500" fontFamily="mono" noOfLines={1}>
                SPD: {item.nomorSPD}
              </Text>
            </HStack>
            <Badge
              bg={getStatusBadgeColor(item.statusId).bg}
              color={getStatusBadgeColor(item.statusId).color}
              fontSize="10px"
              px={2.5}
              py={0.5}
              borderRadius="full"
              fontWeight="bold"
              textTransform="uppercase"
              letterSpacing="wide"
            >
              {getStatusText(item.statusId)}
            </Badge>
          </VStack>
        </HStack>

        {/* Action Buttons */}
        <HStack spacing={2} flexWrap="wrap">
          <Button
            leftIcon={<FiCheckCircle />}
            colorScheme="green"
            size="sm"
            onClick={() => {
              history.push(`/rampung/${item.id}`);
            }}
            _hover={{
              transform: "scale(0.98)",
            }}
            transition="all 0.2s"
            shadow="sm"
            _active={{
              transform: "scale(0.95)",
            }}
          >
            Rampung
          </Button>

          {item.statusId !== 2 && item.statusId !== 3 && (
            <>
              <Button
                leftIcon={<FiEdit3 />}
                bg="white"
                color="gray.700"
                border="1px"
                borderColor="gray.200"
                size="sm"
                onClick={() => onEditClick(item)}
                _hover={{
                  bg: "gray.50",
                  borderColor: "gray.300",
                }}
                transition="all 0.2s"
              >
                Edit
              </Button>
              <Button
                leftIcon={<FiTrash2 />}
                bg="white"
                color="red.500"
                border="1px"
                borderColor="red.200"
                size="sm"
                onClick={() => onHapusClick(item)}
                _hover={{
                  bg: "red.50",
                  borderColor: "red.300",
                }}
                transition="all 0.2s"
              >
                Hapus
              </Button>
            </>
          )}
        </HStack>

        {/* Rincian Biaya Perjalanan */}
        {item.rincianBPDs && item.rincianBPDs.length > 0 && (
          <Box
            bg={sectionBg}
            borderRadius="xl"
            border="1px"
            borderColor={borderCardColor}
            overflow="hidden"
          >
            {/* Header Section */}
            <Box
              px={4}
              py={3}
              bg={headerBg}
              borderBottom="1px"
              borderColor={borderCardColor}
            >
              <HStack justify="space-between" align="center">
                <HStack spacing={2}>
                  <Icon as={FiDollarSign} boxSize={3.5} color="gray.400" />
                  <Text
                    fontSize="xs"
                    fontWeight="bold"
                    color="gray.500"
                    textTransform="uppercase"
                    letterSpacing="wider"
                  >
                    RINCIAN BIAYA PERJALANAN
                  </Text>
                </HStack>
                <Box
                  p={1}
                  bg="teal.50"
                  borderRadius="md"
                  color="teal.600"
                >
                  <Icon as={FiDollarSign} boxSize={3.5} />
                </Box>
              </HStack>
            </Box>

            {/* Cost Items */}
            <VStack spacing={0} align="stretch" divider={<Divider borderColor={borderCardColor} />}>
              {item.rincianBPDs.map((rincian, idx) => {
                const subtotal = rincian.qty * rincian.nilai;
                return (
                  <Box
                    key={idx}
                    px={4}
                    py={3}
                    bg={idx % 2 === 1 ? "gray.50" : "transparent"}
                  >
                    <HStack justify="space-between" align="center">
                      <VStack align="start" spacing={0.5} flex={1}>
                        <Text fontSize="sm" fontWeight="medium" color="gray.700">
                          {rincian.item}
                        </Text>
                        <Text
                          fontSize="xs"
                          color="gray.400"
                          fontFamily="mono"
                        >
                          {rincian.qty} x {formatCurrency(rincian.nilai)}
                        </Text>
                      </VStack>
                      <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                        {formatCurrency(subtotal)}
                      </Text>
                    </HStack>
                  </Box>
                );
              })}
            </VStack>

            {/* Total Biaya */}
            <Box
              px={4}
              py={3}
              bg="teal.50"
              borderTop="2px"
              borderTopColor="teal.100"
            >
              <HStack justify="space-between" align="center">
                <Text fontSize="sm" fontWeight="bold" color="teal.900">
                  Total Biaya
                </Text>
                <Text fontSize="lg" fontWeight="bold" color="teal.700">
                  {formatCurrency(totalBiaya)}
                </Text>
              </HStack>
            </Box>
          </Box>
        )}
      </VStack>
    </Card>
  );
}

export default PersonilCard;
