import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Link, useHistory } from "react-router-dom";
import LayoutAset from "../../Componets/Aset/LayoutAset";
import { Select as Select2, AsyncSelect } from "chakra-react-select";
import {
  Badge,
  Box,
  Button,
  Container,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Skeleton,
  Spacer,
  Table,
  Tbody,
  Td,
  Text,
  Textarea,
  Th,
  Thead,
  Tr,
  useColorMode,
  useDisclosure,
  useToast,
  VStack,
} from "@chakra-ui/react";

function DetailAset(props) {
  const id = props.match.params.id;
  const history = useHistory();
  const toast = useToast();
  const { colorMode } = useColorMode();
  const apiBaseUrl = import.meta.env.VITE_REACT_APP_API_BASE_URL;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isFotoOpen,
    onOpen: onFotoOpen,
    onClose: onFotoClose,
  } = useDisclosure();

  const [detail, setDetail] = useState(null);
  const [unitKerjaList, setUnitKerjaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [unitKerjaTujuanId, setUnitKerjaTujuanId] = useState(null);
  const [selectedPegawai, setSelectedPegawai] = useState(null);
  const [tanggalMutasi, setTanggalMutasi] = useState("");
  const [keterangan, setKeterangan] = useState("");

  const cardBg = colorMode === "dark" ? "gray.800" : "white";
  const headBg = colorMode === "dark" ? "gray.700" : "gray.50";

  const formatTanggal = (value) =>
    value
      ? new Date(value).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "-";

  const formatRupiah = (value) =>
    `Rp ${Number(value || 0).toLocaleString("id-ID")}`;

  const selectStyles = {
    container: (provided) => ({ ...provided, borderRadius: "6px" }),
    control: (provided) => ({
      ...provided,
      backgroundColor: "terang",
      border: "0px",
      minHeight: "44px",
    }),
    option: (provided, state) => ({
      ...provided,
      bg: state.isFocused ? "aset" : "white",
      color: state.isFocused ? "white" : "black",
    }),
  };

  const portalProps = {
    menuPortalTarget: typeof document !== "undefined" ? document.body : null,
    styles: { menuPortal: (base) => ({ ...base, zIndex: 2000 }) },
  };

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${apiBaseUrl}/aset/get/detail/${id}`);
      setDetail(res.data.result || null);
    } catch (err) {
      console.error(err);
      setDetail(null);
      toast({
        title: "Error",
        description: err.response?.data?.message || "Gagal memuat detail aset",
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

  const openMutasi = async () => {
    setUnitKerjaTujuanId(null);
    setSelectedPegawai(null);
    setKeterangan("");
    setTanggalMutasi(new Date().toISOString().slice(0, 10));
    onOpen();
    try {
      const res = await axios.get(`${apiBaseUrl}/aset/get/seed`);
      setUnitKerjaList(res.data.unitKerja || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadPegawai = async (inputValue) => {
    const q = inputValue?.trim();
    if (!q) return [];
    try {
      const res = await axios.get(
        `${apiBaseUrl}/pegawai/search?q=${encodeURIComponent(q)}`,
      );
      return (res.data.result || []).map((item) => ({
        value: item.id,
        label: item.nip ? `${item.nama} — ${item.nip}` : item.nama,
      }));
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  const simpanMutasi = async () => {
    if (!unitKerjaTujuanId || !tanggalMutasi) {
      toast({
        title: "Error",
        description: "Unit kerja tujuan dan tanggal wajib diisi",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      return;
    }
    setSubmitting(true);
    try {
      const res = await axios.post(`${apiBaseUrl}/aset/mutasi/${id}`, {
        unitKerjaTujuanId,
        penanggungjawabTujuanId: selectedPegawai?.value || null,
        tanggal: tanggalMutasi,
        keterangan,
      });
      setDetail(res.data.result || null);
      onClose();
      toast({
        title: "Berhasil",
        description: "Mutasi aset berhasil dicatat",
        status: "success",
        duration: 4000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Gagal mencatat mutasi",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const unitOptions = unitKerjaList
    .filter((item) => item.id !== detail?.unitKerjaId)
    .map((item) => ({ value: item.id, label: item.unitKerja }));

  const riwayat = Array.isArray(detail?.mutasiAsets) ? detail.mutasiAsets : [];

  const InfoRow = ({ label, value }) => (
    <Flex justify="space-between" gap={3} py={1.5}>
      <Text fontSize="sm" color="gray.500">
        {label}
      </Text>
      <Text fontSize="sm" fontWeight="semibold" textAlign="right">
        {value || "-"}
      </Text>
    </Flex>
  );

  if (loading) {
    return (
      <LayoutAset>
        <Box bg="secondary" px={{ base: "12px", md: "30px" }} pb="40px">
          <Container maxW="2880px" p={{ base: "16px", md: "30px" }}>
            <Skeleton height="32px" mb={4} />
            <Skeleton height="180px" />
          </Container>
        </Box>
      </LayoutAset>
    );
  }

  if (!detail) {
    return (
      <LayoutAset>
        <Box bg="secondary" px={{ base: "12px", md: "30px" }} pb="40px">
          <Container maxW="2880px" p="30px" bg={cardBg} borderRadius="8px" textAlign="center">
            <Text mb={4}>Data aset tidak ditemukan</Text>
            <Button variant="primary" onClick={() => history.push("/aset/daftar-aset")}>
              Kembali
            </Button>
          </Container>
        </Box>
      </LayoutAset>
    );
  }

  return (
    <LayoutAset>
      <Box bg="secondary" px={{ base: "12px", md: "30px" }} pb="40px">
        <Container maxW="2880px" p={{ base: "16px", md: "30px" }} bg={cardBg} borderRadius="8px">
          <Flex direction={{ base: "column", md: "row" }} align={{ md: "center" }} mb={6} gap={3}>
            <VStack align="start" spacing={1}>
              <Heading size="lg">{detail.nama}</Heading>
              <Text fontSize="sm" color="gray.500">
                {detail.kode}
              </Text>
            </VStack>
            <Spacer />
            <Button variant="outline" onClick={() => history.push("/aset/daftar-aset")}>
              Kembali
            </Button>
            <Button variant="primary" onClick={openMutasi}>
              Mutasi Unit Kerja
            </Button>
          </Flex>

          <Flex direction={{ base: "column", lg: "row" }} gap={8} align="flex-start">
            <Box flex={1} w="full">
              <Text fontSize="lg" fontWeight="bold" mb={3}>
                Data Aset
              </Text>
              <Text fontSize="2xl" fontWeight="bold" color="green.600" mb={3}>
                {formatRupiah(detail.harga)}
              </Text>
              <Flex gap={2} wrap="wrap" mb={4}>
                <Badge colorScheme="blue">{detail.jenisAset?.nama || "-"}</Badge>
                <Badge colorScheme="green">{detail.kondisiAset?.nama || "-"}</Badge>
                <Badge colorScheme="purple">{detail.daftarUnitKerja?.unitKerja || "-"}</Badge>
              </Flex>
              <Divider mb={3} />
              <InfoRow label="Merek" value={detail.merek} />
              <InfoRow label="Spesifikasi" value={detail.spesifikasi} />
              <InfoRow label="Tanggal Perolehan" value={formatTanggal(detail.tanggal)} />
              <InfoRow label="Unit Kerja" value={detail.daftarUnitKerja?.unitKerja} />
              <InfoRow label="Penanggung Jawab" value={detail.penanggungJawab?.nama} />
              <InfoRow
                label="Pengeluaran"
                value={
                  detail.pengeluaranId ? (
                    <Link to={`/pengeluaran/detail-pengeluaran/${detail.pengeluaranId}`}>
                      <Text as="span" color="purple.600">
                        #{detail.pengeluaranId} {detail.pengeluaran?.deskripsi || ""}
                      </Text>
                    </Link>
                  ) : (
                    "-"
                  )
                }
              />
            </Box>
            {detail.foto && (
              <Box>
                <Text fontSize="sm" color="gray.500" mb={2}>
                  Foto
                </Text>
                <Image
                  src={`${apiBaseUrl}${detail.foto}`}
                  alt={detail.nama}
                  maxW="280px"
                  maxH="280px"
                  objectFit="cover"
                  borderRadius="8px"
                  cursor="pointer"
                  onClick={onFotoOpen}
                />
              </Box>
            )}
          </Flex>

          <Divider my={6} />
          <Text fontSize="lg" fontWeight="bold" mb={4}>
            Riwayat Mutasi
          </Text>
          {riwayat.length === 0 ? (
            <Box py={8} textAlign="center" bg={headBg} borderRadius="md">
              <Text color="gray.500">Belum ada mutasi</Text>
            </Box>
          ) : (
            <Box overflowX="auto" border="1px solid" borderColor="gray.200" borderRadius="8px">
              <Table size="sm">
                <Thead bg={headBg}>
                  <Tr>
                    <Th>No</Th>
                    <Th>Tanggal</Th>
                    <Th>Dari Unit Kerja</Th>
                    <Th>Ke Unit Kerja</Th>
                    <Th>Penanggung Jawab Asal</Th>
                    <Th>Penanggung Jawab Tujuan</Th>
                    <Th>Keterangan</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {riwayat.map((item, index) => (
                    <Tr key={item.id}>
                      <Td>{index + 1}</Td>
                      <Td>{formatTanggal(item.tanggal)}</Td>
                      <Td>{item.unitKerjaAsal?.unitKerja || "-"}</Td>
                      <Td>{item.unitKerjaTujuan?.unitKerja || "-"}</Td>
                      <Td>{item.penanggungJawabAsal?.nama || "-"}</Td>
                      <Td>{item.penanggungJawabTujuan?.nama || "-"}</Td>
                      <Td>{item.keterangan || "-"}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}
        </Container>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose} size="lg" closeOnOverlayClick={false}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Mutasi Aset</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <SimpleGrid columns={1} spacing={4}>
              <FormControl>
                <FormLabel>Unit Kerja Saat Ini</FormLabel>
                <Input value={detail.daftarUnitKerja?.unitKerja || "-"} isReadOnly bg="terang" />
              </FormControl>
              <FormControl>
                <FormLabel>Unit Kerja Tujuan</FormLabel>
                <Select2
                  options={unitOptions}
                  placeholder="Pilih unit kerja tujuan"
                  value={unitOptions.find((opt) => opt.value === unitKerjaTujuanId) || null}
                  onChange={(opt) => setUnitKerjaTujuanId(opt?.value || null)}
                  chakraStyles={selectStyles}
                  {...portalProps}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Penanggung Jawab Tujuan</FormLabel>
                <AsyncSelect
                  loadOptions={loadPegawai}
                  cacheOptions
                  isClearable
                  placeholder="Kosongkan jika tidak berubah"
                  value={selectedPegawai}
                  onChange={setSelectedPegawai}
                  chakraStyles={selectStyles}
                  {...portalProps}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Tanggal Mutasi</FormLabel>
                <Input
                  type="date"
                  bg="terang"
                  value={tanggalMutasi}
                  onChange={(e) => setTanggalMutasi(e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Keterangan</FormLabel>
                <Textarea
                  bg="terang"
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                />
              </FormControl>
            </SimpleGrid>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Batal
            </Button>
            <Button variant="primary" onClick={simpanMutasi} isLoading={submitting}>
              Simpan Mutasi
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isFotoOpen} onClose={onFotoClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Foto Aset</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Image src={`${apiBaseUrl}${detail.foto}`} alt={detail.nama} w="full" objectFit="contain" />
          </ModalBody>
        </ModalContent>
      </Modal>
    </LayoutAset>
  );
}

export default DetailAset;
