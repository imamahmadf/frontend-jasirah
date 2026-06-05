import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import LayoutAset from "../../Componets/Aset/LayoutAset";
import { Link, useHistory } from "react-router-dom";
import {
  Box,
  Text,
  Button,
  Container,
  Heading,
  Flex,
  VStack,
  HStack,
  Badge,
  Divider,
  Image,
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  Spacer,
  Skeleton,
  useColorMode,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from "@chakra-ui/react";

function DetailPengeluaran(props) {
  const id = props.match.params.id;
  const history = useHistory();
  const toast = useToast();
  const { colorMode } = useColorMode();
  const apiBaseUrl = import.meta.env.VITE_REACT_APP_API_BASE_URL;

  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previewFotoUrl, setPreviewFotoUrl] = useState("");
  const {
    isOpen: isPreviewFotoOpen,
    onOpen: onPreviewFotoOpen,
    onClose: onPreviewFotoClose,
  } = useDisclosure();

  const formatTanggal = (d) =>
    d
      ? new Date(d).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "-";

  const formatRupiah = (n) => `Rp ${Number(n || 0).toLocaleString("id-ID")}`;

  const getLineNominal = (item) => {
    const dariField = Number(item?.nominal);
    if (dariField > 0) return dariField;
    return Number(item?.jumlah || 0) * Number(item?.hargaSatuan || 0);
  };

  const getStokMasukList = (data) => {
    if (!data) return [];
    const raw = data.stokMasuks ?? data.stokMasuk;
    return Array.isArray(raw) ? raw : raw ? [raw] : [];
  };

  const fetchDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `${apiBaseUrl}/pengeluaran/get/detail/${id}`,
      );
      setDetail(res.data.result || null);
    } catch (err) {
      console.error(err);
      setDetail(null);
      toast({
        title: "Error",
        description:
          err.response?.data?.message || "Gagal memuat detail pengeluaran",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl, id, toast]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const InfoRow = ({ label, value, valueColor }) => (
    <Flex justify="space-between" align="flex-start" py={1.5} gap={3}>
      <Text fontSize="sm" color="gray.500" flexShrink={0}>
        {label}
      </Text>
      <Text
        fontSize="sm"
        fontWeight="semibold"
        textAlign="right"
        color={valueColor}
        flex={1}
      >
        {value ?? "-"}
      </Text>
    </Flex>
  );

  const cardBg = colorMode === "dark" ? "gray.800" : "white";

  if (loading) {
    return (
      <LayoutAset>
        <Box bgColor="secondary" pb="40px" px={{ base: "12px", md: "30px" }}>
          <Container maxW="2880px" p={{ base: "16px", md: "30px" }}>
            <Skeleton height="32px" mb={4} />
            <Skeleton height="200px" mb={6} />
            <Skeleton height="120px" />
          </Container>
        </Box>
      </LayoutAset>
    );
  }

  if (!detail) {
    return (
      <LayoutAset>
        <Box bgColor="secondary" pb="40px" px={{ base: "12px", md: "30px" }}>
          <Container
            maxW="2880px"
            p={{ base: "16px", md: "30px" }}
            bg={cardBg}
            borderRadius="8px"
            textAlign="center"
          >
            <Text mb={4}>Data pengeluaran tidak ditemukan</Text>
            <Button
              variant="primary"
              onClick={() => history.push("/pengeluaran/daftar-pengeluaran")}
            >
              Kembali ke Daftar
            </Button>
          </Container>
        </Box>
      </LayoutAset>
    );
  }

  const stokMasukList = getStokMasukList(detail);
  const totalNominalBarang = stokMasukList.reduce(
    (sum, item) => sum + getLineNominal(item),
    0,
  );
  const nominalPengeluaran = Number(detail.nominal || 0);
  const nominalSesuai =
    Math.round(totalNominalBarang) === Math.round(nominalPengeluaran);
  const selisihNominal = Math.abs(totalNominalBarang - nominalPengeluaran);
  const statusLabel =
    detail?.statusPembayaran?.nama || detail?.statusPembayaran?.status || "-";

  return (
    <LayoutAset>
      <Box bgColor="secondary" pb="40px" px={{ base: "12px", md: "30px" }}>
        <Container
          maxW="2880px"
          p={{ base: "16px", md: "30px" }}
          bg={cardBg}
          borderRadius="8px"
          boxShadow="sm"
        >
          <Flex
            direction={{ base: "column", md: "row" }}
            align={{ base: "stretch", md: "center" }}
            mb={6}
            gap={4}
          >
            <VStack align="start" spacing={1}>
              <Heading size={{ base: "md", md: "lg" }}>
                Detail Pengeluaran #{detail.id}
              </Heading>
              <Text fontSize="sm" color="gray.500">
                {formatTanggal(detail.tanggal)}
              </Text>
            </VStack>
            <Spacer />
            <Button
              variant="outline"
              onClick={() => history.push("/pengeluaran/daftar-pengeluaran")}
            >
              Kembali
            </Button>
          </Flex>

          <Flex
            direction={{ base: "column", lg: "row" }}
            gap={6}
            mb={8}
            align="flex-start"
          >
            <Box flex={1} w="full">
              <Text fontSize="lg" fontWeight="bold" mb={3}>
                Informasi Pengeluaran
              </Text>
              <Text fontSize="2xl" fontWeight="bold" color="green.600" mb={3}>
                {formatRupiah(detail.nominal)}
              </Text>
              <HStack spacing={2} flexWrap="wrap" mb={4}>
                <Badge colorScheme="green" variant="subtle">
                  {statusLabel}
                </Badge>
                <Badge colorScheme="purple" variant="subtle">
                  {detail?.metodePembayaran?.nama ||
                    detail?.metodePembayaran?.metode ||
                    "-"}
                </Badge>
                <Badge colorScheme="blue" variant="subtle">
                  {detail?.jenisPengeluaran?.nama ||
                    detail?.jenisPengeluaran?.jenis ||
                    "-"}
                </Badge>
              </HStack>
              <Divider mb={3} />
              <InfoRow label="Deskripsi" value={detail.deskripsi || "-"} />
              <InfoRow label="Tanggal" value={formatTanggal(detail.tanggal)} />
              <InfoRow
                label="Jatuh Tempo"
                value={formatTanggal(detail.jatuhTempo)}
              />
              <InfoRow
                label="Proyek"
                value={detail?.daftarUnitKerja?.unitKerja || "-"}
              />
              <InfoRow
                label="Induk Unit Kerja"
                value={detail?.indukUnitKerja?.nama || "-"}
              />
              <InfoRow label="Pegawai" value={detail?.pegawai?.nama || "-"} />
              <InfoRow label="Rekanan" value={detail?.rekanan?.nama || "-"} />
              {detail?.pic && (
                <InfoRow label="PIC" value={detail.pic} />
              )}
            </Box>

            {detail.foto && (
              <Box flexShrink={0}>
                <Text fontSize="sm" color="gray.500" mb={2}>
                  Foto
                </Text>
                <Image
                  src={`${apiBaseUrl}${detail.foto}`}
                  alt="foto pengeluaran"
                  maxW="280px"
                  maxH="280px"
                  objectFit="cover"
                  borderRadius="8px"
                  border="1px solid"
                  borderColor="gray.200"
                  cursor="pointer"
                  onClick={() => {
                    setPreviewFotoUrl(`${apiBaseUrl}${detail.foto}`);
                    onPreviewFotoOpen();
                  }}
                />
              </Box>
            )}
          </Flex>

          <Divider mb={6} />

          <Text fontSize="lg" fontWeight="bold" mb={4}>
            Barang Terkait (Stok Masuk)
          </Text>

          {stokMasukList.length === 0 ? (
            <Box
              py={8}
              textAlign="center"
              bg={colorMode === "dark" ? "gray.700" : "gray.50"}
              borderRadius="md"
            >
              <Text color="gray.500">Belum ada barang terkait</Text>
            </Box>
          ) : (
            <Box overflowX="auto" borderRadius="8px" border="1px solid" borderColor="gray.200">
              <Table variant="simple" size="sm">
                <Thead bg={colorMode === "dark" ? "gray.700" : "gray.50"}>
                  <Tr>
                    <Th>No</Th>
                    <Th>Tanggal</Th>
                    <Th>Proyek</Th>
                    <Th>Nama Barang</Th>
                    <Th>Spesifikasi</Th>
                    <Th isNumeric>Jumlah</Th>
                    <Th>Satuan</Th>
                    <Th isNumeric>Harga Satuan</Th>
                    <Th isNumeric>Total</Th>
                    <Th>Aksi</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {stokMasukList.map((item, index) => (
                    <Tr key={item.id}>
                      <Td>{index + 1}</Td>
                      <Td>{formatTanggal(item.tanggal)}</Td>
                      <Td>
                        {item?.daftarUnitKerja?.unitKerja || "-"}
                      </Td>
                      <Td>{item?.persediaan?.nama || "-"}</Td>
                      <Td>{item?.spesifikasi || "-"}</Td>
                      <Td isNumeric>{item?.jumlah ?? "-"}</Td>
                      <Td>{item?.satuanPersediaan?.satuan || "-"}</Td>
                      <Td isNumeric>
                        {formatRupiah(item?.hargaSatuan)}
                      </Td>
                      <Td isNumeric>
                        {formatRupiah(getLineNominal(item))}
                      </Td>
                      <Td>
                        {item?.persediaanId ? (
                          <Link
                            to={`/aset/tracking-persediaan/${item.persediaanId}`}
                          >
                            <Button size="xs" colorScheme="blue" variant="outline">
                              Tracking
                            </Button>
                          </Link>
                        ) : (
                          "-"
                        )}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
                <Tfoot bg={colorMode === "dark" ? "gray.700" : "gray.50"}>
                  <Tr>
                    <Td colSpan={8} textAlign="right" fontWeight="bold">
                      Total Nominal
                    </Td>
                    <Td
                      isNumeric
                      fontWeight="bold"
                      color={nominalSesuai ? "green.600" : "red.500"}
                    >
                      {formatRupiah(totalNominalBarang)}
                    </Td>
                    <Td />
                  </Tr>
                  <Tr>
                    <Td colSpan={8} textAlign="right" fontSize="sm" color="gray.500">
                      Nominal Pengeluaran
                    </Td>
                    <Td isNumeric fontSize="sm" fontWeight="semibold">
                      {formatRupiah(nominalPengeluaran)}
                    </Td>
                    <Td />
                  </Tr>
                </Tfoot>
              </Table>
            </Box>
          )}

          {stokMasukList.length > 0 && (
            <Box
              mt={3}
              p={3}
              borderRadius="md"
              bg={nominalSesuai ? "green.50" : "red.50"}
              border="1px solid"
              borderColor={nominalSesuai ? "green.200" : "red.200"}
            >
              <Text
                fontSize="sm"
                fontWeight="semibold"
                color={nominalSesuai ? "green.700" : "red.700"}
              >
                {nominalSesuai
                  ? "Total nominal barang terkait sesuai dengan nominal pengeluaran."
                  : `Total nominal barang terkait tidak sesuai. Selisih: ${formatRupiah(selisihNominal)}`}
              </Text>
            </Box>
          )}
        </Container>
      </Box>

      <Modal isOpen={isPreviewFotoOpen} onClose={onPreviewFotoClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Foto Pengeluaran</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Image
              src={previewFotoUrl}
              alt="preview foto pengeluaran"
              w="full"
              objectFit="contain"
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </LayoutAset>
  );
}

export default DetailPengeluaran;
