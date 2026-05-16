import React, { useState } from "react";
import { useDisclosure } from "@chakra-ui/react";
import { useHistory } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Flex,
  Grid,
  GridItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useColorModeValue,
  useToast,
  VStack,
} from "@chakra-ui/react";
import Layout from "../../Componets/Layout";
import Loading from "../../Componets/Loading";
import { useSelector } from "react-redux";
import { userRedux } from "../../Redux/Reducers/auth";
import axios from "axios";
import useDetailData from "./hooks/useDetailData";
import Header from "./Components/Header";
import InformasiPerjalanan from "./Components/InformasiPerjalanan";
import BuktiKegiatan from "./Components/BuktiKegiatan";
import DaftarPersonil from "./Components/DaftarPersonil";
import SubKegiatan from "./Components/SubKegiatan";
import ModalEditPersonil from "./Components/ModalEditPersonil";
import ModalTambahPersonil from "./Components/ModalTambahPersonil";
import ModalHapusPersonil from "./Components/ModalHapusPersonil";
import ModalEditSubKegiatan from "./Components/ModalEditSubKegiatan";
import ModalEditTempat from "./Components/ModalEditTempat";
import ModalEditNomorSurat from "./Components/ModalEditNomorSurat";
import ModalSearchTemplateBPD from "./Components/ModalSearchTemplateBPD";

function Detail(props) {
  const user = useSelector(userRedux);
  const history = useHistory();
  const perjalananId = props.match.params.id;

  // Edit nomor surat hanya boleh jika penomoran induk unit kerja = nonaktif
  const bolehEditNomorSurat =
    user[0]?.unitKerja_profile?.indukUnitKerja?.penomoran === "nonaktif";

  const {
    state,
    actions,
  } = useDetailData(perjalananId, user);

  const {
    detailPerjalanan,
    dataSubKegiatan,
    dataDalamKota,
    dataTemplate,
    templateId,
    isLoading,
    isCreatingAutoBulk,
    isSubmittingPengajuan,
    isPrintingAll,
    randomNumber,
    semuaPersonilBelumAdaRincian,
    adaPersonilYangBisaDiajukan,
    adaStatusDuaAtauTiga,
    adaPersonilYangBisaDicetak,
    validasiRillError,
  } = state;

  const {
    fetchDataPerjalan,
    buatOtomatisBulk,
    pengajuanBulk,
    cetakSemuaKwitansi,
    simpanEditNomorSurat,
    setRandomNumber,
    setTemplateId,
    clearValidasiRillError,
  } = actions;

  // Modal states
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();

  const {
    isOpen: isHapusOpen,
    onOpen: onHapusOpen,
    onClose: onHapusClose,
  } = useDisclosure();

  const {
    isOpen: isTambahOpen,
    onOpen: onTambahOpen,
    onClose: onTambahClose,
  } = useDisclosure();

  const {
    isOpen: isSearchTemplateBPDOpen,
    onOpen: onSearchTemplateBPDOpen,
    onClose: onSearchTemplateBPDClose,
  } = useDisclosure();

  const {
    isOpen: isEditNomorSuratOpen,
    onOpen: onEditNomorSuratOpen,
    onClose: onEditNomorSuratClose,
  } = useDisclosure();

  // State untuk search template BPD
  const [selectedTemplateBPD, setSelectedTemplateBPD] = useState(null);
  const [isSubmittingTemplateBPD, setIsSubmittingTemplateBPD] = useState(false);
  const toast = useToast();

  // State untuk edit personil
  const [pegawaiId, setPegawaiId] = useState(null);
  const [personilId, setPersonilId] = useState(null);
  const [pegawaiLamaId, setPegawaiLamaId] = useState(null);
  const [personilHapusId, setPersonilHapusId] = useState(null);
  const [namaPegawaiHapus, setNamaPegawaiHapus] = useState("");
  const [pegawaiTambahId, setPegawaiTambahId] = useState(null);

  // State untuk edit sub kegiatan
  const [isEditUntukOpen, setIsEditUntukOpen] = useState(false);
  const [editSubKegiatanId, setEditSubKegiatanId] = useState(null);

  // State untuk edit nomor surat
  const [isSubmittingNomorSurat, setIsSubmittingNomorSurat] = useState(false);

  // State untuk edit tempat
  const [isEditTempatOpen, setIsEditTempatOpen] = useState(false);
  const [editTanggalBerangkat, setEditTanggalBerangkat] = useState("");
  const [editTanggalPulang, setEditTanggalPulang] = useState("");
  const [editTujuan, setEditTujuan] = useState("");
  const [editDalamKotaId, setEditDalamKotaId] = useState("");
  const [selectedTempatIndex, setSelectedTempatIndex] = useState(0);
  const [selectedTempatId, setSelectedTempatId] = useState(null);

  // Fungsi untuk mengkonversi tanggal ke format YYYY-MM-DD untuk input date
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  // Handlers
  const handleEditPegawai = async () => {
    try {
      await axios.post(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/pegawai/personil/edit-pegawai`,
        {
          personilId,
          pegawaiBaruId: pegawaiId,
          pegawaiLamaId,
        }
      );
      onEditClose();
      await fetchDataPerjalan();
    } catch (err) {
      console.error(err);
    }
  };

  const handleHapusPersonil = async () => {
    try {
      await axios.post(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/pegawai/personil/hapus/${personilHapusId}`
      );
      onHapusClose();
      await fetchDataPerjalan();
    } catch (err) {
      console.error(err);
    }
  };

  const handleTambahPersonil = async () => {
    try {
      await axios.post(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/pegawai/personil/tambah`,
        {
          perjalananId: perjalananId,
          pegawaiId: pegawaiTambahId,
          indukUnitKerjaId: user[0].unitKerja_profile.indukUnitKerja.id,
          kode: user[0].unitKerja_profile.kode,
          tanggalPengajuan: detailPerjalanan.tanggalPengajuan,
        }
      );
      onTambahClose();
      setPegawaiTambahId(null);
      await fetchDataPerjalan();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditTempat = async () => {
    try {
      const payload = {
        tempatId: selectedTempatId,
        tanggalBerangkat: editTanggalBerangkat,
        tanggalPulang: editTanggalPulang,
      };

      if (detailPerjalanan.jenisPerjalanan?.tipePerjalananId === 1) {
        payload.dalamKotaId = parseInt(editDalamKotaId);
      } else {
        payload.tujuan = editTujuan;
      }

      await axios.post(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/perjalanan/edit-tempat/${perjalananId}`,
        payload
      );
      setIsEditTempatOpen(false);
      await fetchDataPerjalan();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditSubKegiatan = async () => {
    try {
      await axios.post(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/perjalanan/edit/${perjalananId}`,
        {
          subKegiatanId: editSubKegiatanId,
        }
      );
      setIsEditUntukOpen(false);
      await fetchDataPerjalan();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSimpanEditNomorSurat = async (updates) => {
    setIsSubmittingNomorSurat(true);
    try {
      await simpanEditNomorSurat(updates);
      onEditNomorSuratClose();
      toast({
        title: "Berhasil",
        description: "Nomor surat berhasil diperbarui",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: err.response?.data?.message || "Gagal memperbarui nomor surat",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmittingNomorSurat(false);
    }
  };

  // Handlers untuk modal
  const onEditPersonilClick = (item) => {
    setPersonilId(item.id);
    setPegawaiLamaId(item.pegawai.id);
    onEditOpen();
  };

  const onHapusPersonilClick = (item) => {
    setPersonilHapusId(item.id);
    setNamaPegawaiHapus(item.pegawai.nama);
    onHapusOpen();
  };

  const onEditSubKegiatanClick = () => {
    setEditSubKegiatanId(
      detailPerjalanan?.daftarSubKegiatan?.id || null
    );
    setIsEditUntukOpen(true);
  };

  const onEditTempatClick = (tempat, index) => {
    setSelectedTempatIndex(index);
    setSelectedTempatId(tempat.id);

    if (detailPerjalanan.jenisPerjalanan?.tipePerjalananId === 1) {
      setEditDalamKotaId(tempat.dalamKota?.id || "");
      setEditTujuan("");
    } else {
      setEditTujuan(tempat.tempat || "");
      setEditDalamKotaId("");
    }

    setEditTanggalBerangkat(formatDateForInput(tempat.tanggalBerangkat));
    setEditTanggalPulang(formatDateForInput(tempat.tanggalPulang));
    setIsEditTempatOpen(true);
  };

  const onEditPerjalananClick = () => {
    setEditSubKegiatanId(
      detailPerjalanan?.daftarSubKegiatan?.id || null
    );
    setIsEditUntukOpen(true);
  };

  // Handler untuk pilih template BPD
  const handlePilihTemplateBPD = async () => {
    if (!selectedTemplateBPD?.data) return;

    setIsSubmittingTemplateBPD(true);
    try {
      // Kumpulkan semua personil ID
      const personilIds = detailPerjalanan?.personils?.map((p) => p.id) || [];

      // Siapkan data template BPD beserta relasinya
      const templateData = selectedTemplateBPD.data;
      const templateRillData = templateData.templateRills || templateData.templateRill || [];

      // Ambil data tanggal dari tempats (menggunakan tempat pertama sebagai referensi)
      const tempats = detailPerjalanan?.tempats || [];
      const tanggalBerangkat = tempats.length > 0 ? tempats[0].tanggalBerangkat : null;
      const tanggalPulang = tempats.length > 0 ? tempats[tempats.length - 1].tanggalPulang : null;

      // Kirim data ke API
      const payload = {
        perjalananId: perjalananId,
        templateBPDId: templateData.id,
        namaKota: templateData.namaKota,
        uangHarian: templateData.uangHarian,
        unitKerjaId: templateData.unitKerjaId,
        tanggalBerangkat: tanggalBerangkat,
        tanggalPulang: tanggalPulang,
        templateRill: templateRillData.map((rill) => ({
          id: rill.id,
          uraian: rill.uraian,
          nilai: rill.nilai,
        })),
        personilIds: personilIds,
      };

      await axios.post(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/templateBPD/apply`,
        payload
      );

      toast({
        title: "Berhasil",
        description: `Template BPD "${templateData.namaKota}" berhasil diterapkan ke ${personilIds.length} personil`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      onSearchTemplateBPDClose();
      setSelectedTemplateBPD(null);
      
      // Refresh data perjalanan
      await fetchDataPerjalan();
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: err.response?.data?.message || "Gagal menerapkan template BPD",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmittingTemplateBPD(false);
    }
  };

  if (isLoading) return <Loading />;

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const headerBg = useColorModeValue("primary", "primary");

  return (
    <>
      <Layout>
        <Box minH="100vh">
          <Header
            detailPerjalanan={detailPerjalanan}
            adaStatusDuaAtauTiga={adaStatusDuaAtauTiga}
            onEditClick={onEditPerjalananClick}
            penomoran={user[0]?.unitKerja_profile?.indukUnitKerja?.penomoran}
            keuangan={user[0]?.unitKerja_profile?.indukUnitKerja?.keuangan}
          />

          <Container
            maxW={{ base: "100%", md: "1280px", lg: "1380px" }}
            px={{ base: 4, md: 6 }}
          >
            {/* Grid untuk Layout Utama */}
            <Grid
              templateColumns={{ base: "1fr", lg: "2fr 1fr" }}
              gap={{ base: 4, md: 6, lg: 8 }}
              mb={{ base: 6, md: 8 }}
            >
              {/* Kolom Kiri - Informasi Perjalanan, Sub Kegiatan, Pejabat Berwenang */}
              <GridItem display="flex" flexDirection="column">
                <InformasiPerjalanan
                  detailPerjalanan={detailPerjalanan}
                  adaStatusDuaAtauTiga={adaStatusDuaAtauTiga}
                  onEditTempatClick={onEditTempatClick}
                  onEditNomorSuratClick={bolehEditNomorSurat ? onEditNomorSuratOpen : undefined}
                  onEditSubKegiatanClick={onEditSubKegiatanClick}
                  formatDateForInput={formatDateForInput}
                  cardBg={cardBg}
                  borderColor={borderColor}
                  headerBg={headerBg}
                />
              </GridItem>

              {/* Kolom Kanan - Bukti Kegiatan, Kendaraan Dinas */}
              <GridItem display="flex" flexDirection="column">
                <BuktiKegiatan
                  detailPerjalanan={detailPerjalanan}
                  setRandomNumber={setRandomNumber}
                  cardBg={cardBg}
                  borderColor={borderColor}
                  headerBg={headerBg}
                />
              </GridItem>
            </Grid>

            {/* Personil Section */}
            <DaftarPersonil
              detailPerjalanan={detailPerjalanan}
              adaStatusDuaAtauTiga={adaStatusDuaAtauTiga}
              semuaPersonilBelumAdaRincian={semuaPersonilBelumAdaRincian}
              adaPersonilYangBisaDiajukan={adaPersonilYangBisaDiajukan}
              adaPersonilYangBisaDicetak={adaPersonilYangBisaDicetak}
              keuangan={user[0]?.unitKerja_profile?.indukUnitKerja?.keuangan}
              isSubmittingPengajuan={isSubmittingPengajuan}
              isCreatingAutoBulk={isCreatingAutoBulk}
              isPrintingAll={isPrintingAll}
              onPengajuanBulk={pengajuanBulk}
              onBuatOtomatisBulk={buatOtomatisBulk}
              onCetakSemuaKwitansi={cetakSemuaKwitansi}
              onTambahPersonil={() => {
                setPegawaiTambahId(null);
                onTambahOpen();
              }}
              onEditPersonil={onEditPersonilClick}
              onHapusPersonil={onHapusPersonilClick}
              onSearchTemplateBPD={() => {
                setSelectedTemplateBPD(null);
                onSearchTemplateBPDOpen();
              }}
              dataTemplate={dataTemplate}
              templateId={templateId}
              setTemplateId={setTemplateId}
              cardBg={cardBg}
              borderColor={borderColor}
              headerBg={headerBg}
            />
          </Container>

          {/* Modals */}
          <ModalEditPersonil
            isOpen={isEditOpen}
            onClose={onEditClose}
            pegawaiId={pegawaiId}
            setPegawaiId={setPegawaiId}
            onSave={handleEditPegawai}
            headerBg={headerBg}
          />

          <ModalTambahPersonil
            isOpen={isTambahOpen}
            onClose={onTambahClose}
            pegawaiTambahId={pegawaiTambahId}
            setPegawaiTambahId={setPegawaiTambahId}
            onSave={handleTambahPersonil}
            detailPerjalanan={detailPerjalanan}
            headerBg={headerBg}
          />

          <ModalHapusPersonil
            isOpen={isHapusOpen}
            onClose={onHapusClose}
            onConfirm={handleHapusPersonil}
            namaPegawaiHapus={namaPegawaiHapus}
          />

          <ModalEditSubKegiatan
            isOpen={isEditUntukOpen}
            onClose={() => setIsEditUntukOpen(false)}
            editSubKegiatanId={editSubKegiatanId}
            setEditSubKegiatanId={setEditSubKegiatanId}
            dataSubKegiatan={dataSubKegiatan}
            onSave={handleEditSubKegiatan}
            headerBg={headerBg}
          />

          <ModalEditTempat
            isOpen={isEditTempatOpen}
            onClose={() => setIsEditTempatOpen(false)}
            detailPerjalanan={detailPerjalanan}
            selectedTempatIndex={selectedTempatIndex}
            editTanggalBerangkat={editTanggalBerangkat}
            setEditTanggalBerangkat={setEditTanggalBerangkat}
            editTanggalPulang={editTanggalPulang}
            setEditTanggalPulang={setEditTanggalPulang}
            editTujuan={editTujuan}
            setEditTujuan={setEditTujuan}
            editDalamKotaId={editDalamKotaId}
            setEditDalamKotaId={setEditDalamKotaId}
            dataDalamKota={dataDalamKota}
            onSave={handleEditTempat}
            borderColor={borderColor}
            headerBg={headerBg}
          />

          <ModalEditNomorSurat
            isOpen={isEditNomorSuratOpen}
            onClose={onEditNomorSuratClose}
            detailPerjalanan={detailPerjalanan}
            onSave={handleSimpanEditNomorSurat}
            headerBg={headerBg}
            isLoading={isSubmittingNomorSurat}
          />

          <ModalSearchTemplateBPD
            isOpen={isSearchTemplateBPDOpen}
            onClose={() => {
              if (!isSubmittingTemplateBPD) {
                onSearchTemplateBPDClose();
                setSelectedTemplateBPD(null);
              }
            }}
            selectedTemplateBPD={selectedTemplateBPD}
            setSelectedTemplateBPD={setSelectedTemplateBPD}
            onSave={handlePilihTemplateBPD}
            headerBg={headerBg}
            unitKerjaId={user?.[0]?.unitKerja_profile?.id}
            isLoading={isSubmittingTemplateBPD}
            personilCount={detailPerjalanan?.personils?.length || 0}
          />

          {/* Modal Peringatan Validasi Rill (Dalam Kota) */}
          <Modal
            closeOnOverlayClick={false}
            isOpen={!!validasiRillError}
            onClose={clearValidasiRillError}
            isCentered
          >
            <ModalOverlay />
            <ModalContent borderRadius="lg" maxWidth="500px">
              <ModalHeader color="red.600">Validasi Gagal</ModalHeader>
              <ModalCloseButton />
              <ModalBody pb={6}>
                <Text mb={2}>
                  Total nilai rincian <strong>Rill</strong> tidak boleh melebihi
                  uang transport maksimal untuk perjalanan dalam kota.
                  {validasiRillError?.namaPegawai && (
                    <>
                      {" "}
                      Personil <strong>{validasiRillError.namaPegawai}</strong>{" "}
                      melebihi batas.
                    </>
                  )}
                </Text>
                <VStack align="stretch" spacing={2} py={2}>
                  <Flex justify="space-between">
                    <Text color="gray.600">Total nilai Rill:</Text>
                    <Text fontWeight="semibold" color="red.600">
                      {validasiRillError &&
                        new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                        }).format(validasiRillError.totalNilaiRill)}
                    </Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text color="gray.600">Batas maksimal:</Text>
                    <Text fontWeight="semibold">
                      {validasiRillError &&
                        new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                        }).format(validasiRillError.maxUangTransport)}
                    </Text>
                  </Flex>
                </VStack>
                <Text fontSize="sm" color="gray.600">
                  Silakan perbaiki rincian BPD agar total nilai Rill tidak
                  melebihi batas di atas, lalu ajukan kembali.
                </Text>
              </ModalBody>
              <ModalFooter>
                <Button colorScheme="blue" onClick={clearValidasiRillError}>
                  Mengerti
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </Box>
      </Layout>
    </>
  );
}

export default Detail;
