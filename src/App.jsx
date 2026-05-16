import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { useState, useEffect } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import Home from "./pages/Home";
import Daftar from "./pages/Daftar";
import Detail from "./pages/Detail/Detail";
import Rill from "./pages/Rill";
import Login from "./pages/login";
import Register from "./pages/Register.jsx";
import Rampung from "./pages/Rampung";
import { useDispatch } from "react-redux";
import axios from "axios";
import { loginSuccess, logout } from "./Redux/Reducers/auth.js";
import ProtectedRoute from "./Componets/ProtectedRoute";
import Template from "./pages/Template.jsx";
import DaftarSuratTugas from "./pages/Surat/DaftarSuratTugas.jsx";
import RampungAdmin from "./pages/Admin/RampungAdmin.jsx";
import Perjalanan from "./pages/Perjalanan/Perjalanan.jsx";
import suratKeluarAdmin from "./pages/Admin/suratKeluarAdmin.jsx";
import PengaturanPegawai from "./pages/PengaturanPegawai.jsx";
import DaftarPegawai from "./pages/DaftarPegawai.jsx";
import EditPegawai from "./pages/Admin/EditPegawai.jsx";
import DalamKota from "./pages/DalamKota.jsx";
import DalamKotaAdmin from "./pages/Admin/DalamKotaAdmin.jsx";
import IndukUnitKerjaAdmin from "./pages/Admin/IndukUnitKerjaAdmin.jsx";
import DetailPegawaiAdmin from "./pages/Admin/DetailPegawaiAdmin.jsx";
import DaftarAdmin from "./pages/Admin/DaftarAdmin.jsx";
import TambahUser from "./pages/Admin/TambahUser.jsx";
import UnitKerjaAdmin from "./pages/Admin/UnitKerjaAdmin.jsx";
import TtdSuratTugasAdmin from "./pages/Admin/TtdSuratTugasAdmin.jsx";
import DaftarIndukUnitKerjaAdmin from "./pages/Admin/DaftarIndukUnitKerjaAdmin.jsx";
import DaftarBendaharaAdmin from "./pages/Admin/DaftarBendaharaAdmin.jsx";
import TambahBendahara from "./pages/Admin/TambahBendahara.jsx";
import NomorSuratAdmin from "./pages/Admin/NomorSuratAdmin.jsx";
import SubKegiatanAdmin from "./pages/Admin/SubKegiatanAdmin.jsx";
import DaftarUserAdmin from "./pages/Admin/DaftarUserAdmin.jsx";
import EditJenisSurat from "./pages/Admin/EditJenisSurat.jsx";
import TemplateKeuangan from "./pages/Admin/TemplateKeuangan.jsx";
import DetailIndukUnitKerja from "./pages/Admin/DetailIndukUnitKerja.jsx";
import DaftarPerjalananPegawai from "./pages/Admin/DaftarPerjalananPegawai.jsx";
import SumberDanaAdmin from "./pages/Admin/SumberDanaAdmin.jsx";
import StatistikPegawai from "./pages/Admin/StatistikPegawai.jsx";
import SuratTugasKadis from "./pages/SuratTugasKadis.jsx";
import Profile from "./pages/Profile.jsx";
import DeveloperProfile from "./pages/DeveloperProfile.jsx";
import TemplateKadis from "./pages/TemplateKadis.jsx";
import PegawaiUnitKerja from "./pages/PegawaiUnitKerja.jsx";
import PerjalananKadis from "./pages/PerjalananKadis/PerjalananKadis.jsx";
import RekapPerjalanan from "./pages/RekapPerjalanan.jsx";
import KadisKalender from "./pages/KadisKalender.jsx";
import DaftarKendaraan from "./pages/Sijaka/DaftarKendaraan.jsx";
import DetailKendaraan from "./pages/Sijaka/DetailKendaraan.jsx";
import KendaraanUnitKerja from "./pages/Sijaka/KendaraanUnitKerja.jsx";
import TemplateAset from "./pages/Sijaka/TemplateAset.jsx";
import DetailKendaraanUnitKerja from "./pages/Sijaka/DetailKendaraanUnitkerja.jsx";
import pegawaiProfile from "./pages/pegawaiProfile.jsx";
import UsulanPegawai from "./pages/UsulanPegawai.jsx";
import DashboradPegawai from "./pages/DashboradPegawai.jsx";
import NaikGolongan from "./pages/Pegawai/NaikGolongan.jsx";
import DetailUsulan from "./pages/Pegawai/DetailUsulan.jsx";
import DaftarPersediaan from "./pages/Aset/DaftarPersediaan.jsx";
import PersediaanMasuk from "./pages/Aset/PersediaanMasuk.jsx";
import PersediaanKeluar from "./pages/Aset/PersediaanKeluar.jsx";
import DashboardAset from "./pages/Aset/DashboardAset.jsx";
import LaporanPersediaan from "./pages/Aset/LaporanPersediaan.jsx";
import DetailLaporan from "./pages/Aset/DetailLaporan.jsx";
import DaftarSPPD from "./pages/Surat/DaftarSPPD.jsx";
import LaporanPersediaanKeluar from "./pages/Aset/LaporanPersediaanKeluar.jsx";
import RekapAdminAset from "./pages/Aset/RekapAdminAset.jsx";
import SuratPesanan from "./pages/Aset/SuratPesanan.jsx";
import LaporanUsulanPegawai from "./pages/Pegawai/LaporanUsulanPegawai.jsx";
import NaikJenjang from "./pages/Pegawai/NaikJenjang.jsx";
import DaftarNaikJenjang from "./pages/Pegawai/DaftarNaikJenjang.jsx";
import DetailNaikJenjang from "./pages/Pegawai/DetailNaikJenjang.jsx";
import DaftarKwitansiGlobal from "./pages/DaftarKwitansiGlobal.jsx";
import DetailKwitansiGlobal from "./pages/DetailKwitansiGlobal.jsx";
import DaftarKwitansiGlobalKeuangan from "./pages/Admin/DaftarKwitansiGlobalKeuangan.jsx";
import DetailKwitansiGlobalKeuangan from "./pages/Admin/DetailKwitansiGlobalKeuangan.jsx";
import verifikasi from "./pages/Verifikasi.jsx";
// /////PERENCANAAN////////////
import DashboardPerencanaan from "./pages/Perencanaan/DashboardPerencanaan.jsx";
import DaftarProgram from "./pages/Perencanaan/DaftarProgram.jsx";
import DetailSubKegiatan from "./pages/Perencanaan/DetailSubKegiatan.jsx";
import DetailProgram from "./pages/Perencanaan/DetailProgram.jsx";
import DetailKegiatan from "./pages/Perencanaan/DetailKegiatan.jsx";
import DaftarIndikator from "./pages/Perencanaan/DaftarIndikator.jsx";
import DaftarCapaian from "./pages/Perencanaan/DaftarCapaian.jsx";
import AdminSubKegiatan from "./pages/Perencanaan/AdminSubKegiatan.jsx";
import AdminKegiatan from "./pages/Perencanaan/AdminKegiatan.jsx";
import AdminProgram from "./pages/Perencanaan/AdminProgram.jsx";
import SatuanIndikator from "./pages/Perencanaan/SatuanIndikator.jsx";
import Indikator from "./pages/Perencanaan/Indikator.jsx";
// ////////PENA///////////////////
import DaftarKendaraanDinas from "./pages/KendaraanDinas/DaftarKendaraanDinas.jsx";
import KendaraanSaya from "./pages/KendaraanDinas/KendaraanSaya.jsx";
import DetailkendaraanDinas from "./pages/KendaraanDinas/DetailKendaraanDinas.jsx";
import PerjalananKendaraanDinas from "./pages/KendaraanDinas/Perjalanan/PerjalananKendaraanDinas.jsx";
import DaftarPerjalananKendaraan from "./pages/KendaraanDinas/DaftarPerjalananKendaraan.jsx";
// /////BARJAS///////////////////////
import DaftarDokumen from "./pages/Barjas/DaftarDokumen.jsx";
import DetailSP from "./pages/Barjas/DetailSP.jsx";
import PengaturanBarjas from "./pages/Barjas/PengaturanBarjas.jsx";
import JenisDokumenBarjas from "./pages/Barjas/JenisDokumenBarjas.jsx";
import NomorSPBarjas from "./pages/Barjas/NomorSPBarjas.jsx";
//////PJPL//////////////////////

import PejabatVerifikator from "./pages/PJPL/PejabatVerifikator.jsx";
import KontrakPJPL from "./pages/PJPL/KontrakPJPL.jsx";
import KinerjaPJPL from "./pages/PJPL/KinerjaPJPL.jsx";
import DetailKinerjaPJPL from "./pages/PJPL/DetailKinerjaPJPL.jsx";
import HasilKerjaPJPL from "./pages/PJPL/HasilKerjaPJPL.jsx";
import DaftarLaporanPJPL from "./pages/PJPL/DaftarLaporanPJPL.jsx";
import AtasanDaftarKontrak from "./pages/PJPL/AtasanDaftarKontrak.jsx";
import AtasanDetailKontrak from "./pages/PJPL/AtasanDetailKontrak.jsx";
import PenilaianAtasan from "./pages/PJPL/PenilaianAtasan.jsx";
import DashboardKeuangan from "./pages/Keuangan/DashboardKeuangan.jsx";
import DetailKontrakPJPL from "./pages/PJPL/DetailKontrakPJPL.jsx";
import LoginPegawai from "./pages/LoginPegawai.jsx";
import Unauthorized from "./pages/Unauthorized.jsx";

// /////////KEUANGAN/////////////////////
import templateBPD from "./pages/Keuangan/templateBPD.jsx";
import templateBPDKeuangan from "./pages/Keuangan/TemplateBPDKeuangan.jsx";

//////////////////////APLIKASI_PJLP//////////////////////
import VerifikasiRencanaAksiKerja from "./pages/Aplikasi_PJLP/Atasan/VerifikasiRencanaAksiKerja.jsx";
import IndikatorKualitatifPJPL from "./pages/Aplikasi_PJLP/Admin/IndikatorKualitatifPJPL.jsx";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.log("cek gak token");
          dispatch(logout());
          return;
        }
        console.log("cek ada token");
        const { data } = await axios.get(
          `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/user/check-auth`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        console.log(data);
        if (data.isAuthenticated) {
          dispatch(
            loginSuccess({
              token: token,
              role: data.user?.role, // Pastikan role disimpan
            }),
          );
        } else {
          dispatch(logout());
        }
      } catch (error) {
        dispatch(logout());
      }
    };

    checkAuth();
  }, [dispatch]);
  return (
    <>
      <BrowserRouter>
        <Switch>
          <ProtectedRoute
            component={Daftar}
            path="/perjalanan/daftar"
            exact
            roleRoute={[5, 1]}
          />
          <ProtectedRoute
            component={SuratTugasKadis}
            path="/kepala-dinas/daftar-kadis"
            exact
            roleRoute={[5, 1]}
          />
          <ProtectedRoute
            component={KadisKalender}
            path="/perjalanan/kalender-kadis"
            exact
            roleRoute={[5, 1]}
          />
          <ProtectedRoute
            component={Profile}
            path="/profile"
            exact
            roleRoute={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
          />
          <ProtectedRoute
            component={Rampung}
            path="/rampung/:id"
            exact
            roleRoute={[5, 1]}
          />
          <ProtectedRoute
            component={suratKeluarAdmin}
            path="/surat/surat-keluar"
            exact
            roleRoute={[5, 4]}
          />
          <ProtectedRoute
            component={Detail}
            path="/detail-perjalanan/:id"
            exact
            roleRoute={[5, 1]}
          />
          <ProtectedRoute
            component={Rill}
            path="/rill/:kwitId"
            exact
            roleRoute={[5, 1]}
          />
          <Route component={Login} path="/login" />
          <Route component={Register} path="/register" />
          <Route component={Unauthorized} path="/unauthorized" exact />
          <ProtectedRoute
            component={Template}
            path="/unit-kerja/template"
            exact
            roleRoute={[5, 1]}
          />
          <ProtectedRoute
            component={TemplateKadis}
            path="/kepala-dinas/template-kadis"
            exact
            roleRoute={[5, 1]}
          />
          <ProtectedRoute
            component={PerjalananKadis}
            path="/kepala-dinas/perjalanan-kadis"
            exact
            roleRoute={[5, 6]}
          />
          <ProtectedRoute
            component={RampungAdmin}
            path="/admin/rampung/:id"
            exact
            roleRoute={[3, 5]}
          />
          <ProtectedRoute
            component={Perjalanan}
            path="/perjalanan"
            exact
            roleRoute={[5, 1]}
          />
          <ProtectedRoute
            component={PengaturanPegawai}
            path="/admin/pengaturan-pegawai/:id"
          />
          <ProtectedRoute
            component={DaftarPegawai}
            path="/admin-pegawai/daftar-pegawai"
            exact
            roleRoute={[5, 7]}
          />
          <ProtectedRoute
            component={DetailPegawaiAdmin}
            path="/admin-pegawai/daftar-pegawai/:id"
            exact
            roleRoute={[5, 7]}
          />
          <ProtectedRoute
            component={UsulanPegawai}
            path="/kepegawaian/usulan"
            exact
            roleRoute={[5, 7]}
          />
          <ProtectedRoute
            component={DaftarNaikJenjang}
            path="/admin-pegawai/daftar-naik-jenjang"
            exact
            roleRoute={[5, 7]}
          />
          <ProtectedRoute
            component={LaporanUsulanPegawai}
            path="/admin-pegawai/laporan-usulan-pegawai"
            exact
            roleRoute={[5, 7]}
          />
          <ProtectedRoute
            component={StatistikPegawai}
            path="/admin-pegawai/statistik-pegawai"
            exact
            roleRoute={[5, 7]}
          />
          <ProtectedRoute
            component={EditPegawai}
            path="/admin/edit-pegawai/:id"
            exact
            roleRoute={[5, 7, 2]}
          />
          <ProtectedRoute
            component={DalamKotaAdmin}
            path="/keuangan/dalam-kota"
            roleRoute={[3, 5]}
          />
          <ProtectedRoute
            component={DaftarKwitansiGlobalKeuangan}
            path="/keuangan/daftar-kwitansi-global"
            roleRoute={[3, 5]}
          />
          <ProtectedRoute
            component={DetailKwitansiGlobalKeuangan}
            path="/keuangan/detail-kwitansi-global/:id"
            roleRoute={[3, 5]}
          />
          <ProtectedRoute
            component={DaftarAdmin}
            path="/keuangan/daftar-perjalanan"
            exact
            roleRoute={[3, 5]}
          />
          <ProtectedRoute
            component={TemplateKeuangan}
            path="/keuangan/template"
            exact
            roleRoute={[3, 5]}
          />
          <ProtectedRoute
            component={SumberDanaAdmin}
            path="/keuangan/sumber-dana"
            exact
            roleRoute={[3, 5]}
          />
          <ProtectedRoute
            component={DaftarPerjalananPegawai}
            path="/keuangan/perjalanan-pegawai"
            exact
            roleRoute={[3]}
          />
          <ProtectedRoute
            component={IndukUnitKerjaAdmin}
            path="/unit-kerja/induk-unit-kerja"
            exact
            roleRoute={[2]}
          />
          <ProtectedRoute
            component={DaftarIndukUnitKerjaAdmin}
            path="/admin/daftar-induk-unit-kerja"
            exact
            roleRoute={[5]}
          />
          <ProtectedRoute
            component={DetailIndukUnitKerja}
            path="/admin/detail-induk-unit-kerja/:id"
            exact
            roleRoute={[5]}
          />
          <ProtectedRoute
            component={TambahUser}
            path="/admin/tambah-user"
            exact
            roleRoute={[5]}
          />
          <ProtectedRoute
            component={DaftarUserAdmin}
            path="/admin/daftar-user"
            exact
            roleRoute={[5]}
          />
          <ProtectedRoute
            component={DetailPegawaiAdmin}
            path="/admin/detail-pegawai/:id"
            exact
            roleRoute={[3, 5]}
          />
          <ProtectedRoute
            component={NomorSuratAdmin}
            path="/surat/nomor"
            exact
            roleRoute={[4, 5]}
          />
          <ProtectedRoute
            component={DaftarSPPD}
            path="/surat/sppd"
            exact
            roleRoute={[4, 5]}
          />
          <ProtectedRoute
            component={DaftarSuratTugas}
            path="/surat/surat-tugas"
            exact
            roleRoute={[4, 5]}
          />
          <ProtectedRoute
            component={TtdSuratTugasAdmin}
            path="/admin/ttd-surat-tugas"
            exact
            roleRoute={[2, 5]}
          />
          <ProtectedRoute
            component={UnitKerjaAdmin}
            path="/admin/unit-kerja/:id"
            exact
            roleRoute={[2, 5]}
          />
          <ProtectedRoute
            component={DaftarBendaharaAdmin}
            path="/unit-kerja/daftar-bendahara"
            exact
            roleRoute={[2, 5]}
          />
          <ProtectedRoute
            component={TambahBendahara}
            path="/admin/tambah-bendahara"
            exact
            roleRoute={[2, 5]}
          />
          <ProtectedRoute
            component={EditJenisSurat}
            path="/admin/edit-jenis-surat"
            exact
            roleRoute={[5]}
          />
          <ProtectedRoute
            component={SubKegiatanAdmin}
            path="/unit-kerja/sub-kegiatan"
            exact
            roleRoute={[2, 1]}
          />
          <ProtectedRoute
            component={PegawaiUnitKerja}
            path="/unit-kerja/daftar-pegawai"
            exact
            roleRoute={[5, 2]}
          />
          <ProtectedRoute
            component={RekapPerjalanan}
            path="/perjalanan/rekap"
            exact
            roleRoute={[1, 5]}
          />
          <ProtectedRoute
            component={DaftarKendaraan}
            path="/sijaka/daftar-kendaraan"
            exact
            roleRoute={[5, 8]}
          />
          <ProtectedRoute
            component={TemplateAset}
            path="/sijaka/template"
            exact
            roleRoute={[5, 8]}
          />
          <ProtectedRoute
            component={DetailKendaraan}
            path="/sijaka/detail-kendaraan/:id"
            exact
            roleRoute={[5, 8]}
          />
          <ProtectedRoute
            component={DetailKendaraanUnitKerja}
            path="/sijaka/detail-kendaraan/unit-kerja/:id"
            exact
            roleRoute={[5, 10, 8]}
          />
          <ProtectedRoute
            component={KendaraanUnitKerja}
            path="/kendaraan/unit-kerja"
            exact
            roleRoute={[5, 10, 8]}
          />
          <ProtectedRoute
            component={pegawaiProfile}
            path="/kepegawaian/profile"
            exact
            roleRoute={[5, 2, 9]}
          />
          <ProtectedRoute
            component={DashboradPegawai}
            path="/pegawai/dashboard"
            exact
            roleRoute={[9, 5]}
          />
          <ProtectedRoute
            component={NaikGolongan}
            path="/kepegawaian-ASN/naik-golongan"
            exact
            roleRoute={[9, 5]}
          />
          <ProtectedRoute
            component={NaikJenjang}
            path="/kepegawaian-ASN/naik-jenjang"
            exact
            roleRoute={[9, 5]}
          />
          <ProtectedRoute
            component={DetailUsulan}
            path="/pegawai/detail-usulan/:id"
            exact
            roleRoute={[9, 5]}
          />
          <ProtectedRoute
            component={DetailNaikJenjang}
            path="/pegawai/detail-naik-jenjang/:id"
            exact
            roleRoute={[9, 5]}
          />
          <ProtectedRoute
            component={RekapAdminAset}
            path="/admin-aset/rekap-persediaan/:id"
            exact
            roleRoute={[5, 10]}
          />
          <ProtectedRoute
            component={DaftarPersediaan}
            path="/aset/daftar-persediaan"
            exact
            roleRoute={[5]}
          />
          <ProtectedRoute
            component={SuratPesanan}
            path="/aset/surat-pesanan"
            exact
            roleRoute={[5, 10]}
          />
          <ProtectedRoute
            component={PersediaanMasuk}
            path="/aset/persediaan-masuk"
            exact
            roleRoute={[5]}
          />
          <ProtectedRoute
            component={PersediaanKeluar}
            path="/aset/persediaan-keluar"
            exact
            roleRoute={[5]}
          />
          <ProtectedRoute
            component={DashboardAset}
            path="/aset/dashboard"
            exact
            roleRoute={[5, 10, 8]}
          />
          <ProtectedRoute
            component={LaporanPersediaan}
            path="/aset/laporan-persediaan"
            exact
            roleRoute={[5, 10, 8]}
          />
          <ProtectedRoute
            component={DetailLaporan}
            path="/aset/detail-laporan/:id"
            exact
            roleRoute={[5, 10, 8]}
          />
          <ProtectedRoute
            component={LaporanPersediaanKeluar}
            path="/aset/detail-laporan-keluar/:id"
            exact
            roleRoute={[5, 10, 8]}
          />
          <ProtectedRoute
            component={DaftarKwitansiGlobal}
            path="/perjalanan/kwitansi-global"
            exact
            roleRoute={[5, 1]}
          />
          <ProtectedRoute
            component={DetailKwitansiGlobal}
            path="/perjalanan/detail-kwitansi-global/:id"
            exact
            roleRoute={[5, 1]}
          />
          {/* PERENCANAAN */}
          <ProtectedRoute
            component={DetailSubKegiatan}
            path="/perencanaan/detail-sub-kegiatan/:id"
            exact
            roleRoute={[5, 11]}
          />
          <ProtectedRoute
            component={DetailKegiatan}
            path="/perencanaan/detail-kegiatan/:id"
            exact
            roleRoute={[5, 11]}
          />
          <ProtectedRoute
            component={DetailProgram}
            path="/perencanaan/detail-program/:id"
            exact
            roleRoute={[5, 11]}
          />
          <ProtectedRoute
            component={DashboardPerencanaan}
            path="/perencanaan"
            exact
            roleRoute={[5, 11]}
          />
          <ProtectedRoute
            component={DaftarProgram}
            path="/perencanaan/daftar-program"
            exact
            roleRoute={[5, 11]}
          />
          <ProtectedRoute
            component={DaftarIndikator}
            path="/perencanaan/daftar-indikator"
            exact
            roleRoute={[5, 11]}
          />
          <ProtectedRoute
            component={DaftarCapaian}
            path="/perencanaan/daftar-capaian"
            exact
            roleRoute={[5, 11]}
          />
          <ProtectedRoute
            component={AdminSubKegiatan}
            path="/admin-perencanaan/sub-kegiatan"
            exact
            roleRoute={[5, 11]}
          />
          <ProtectedRoute
            component={AdminKegiatan}
            path="/admin-perencanaan/kegiatan"
            exact
            roleRoute={[5, 11]}
          />
          <ProtectedRoute
            component={AdminProgram}
            path="/admin-perencanaan/program"
            exact
            roleRoute={[5, 11]}
          />
          <ProtectedRoute
            component={SatuanIndikator}
            path="/admin-perencanaan/satuan-indikator"
            exact
            roleRoute={[5, 11]}
          />
          <ProtectedRoute
            component={Indikator}
            path="/admin-perencanaan/indikator"
            exact
            roleRoute={[5, 11]}
          />
          {/* ////////PENA/////// */}
          <ProtectedRoute
            component={DaftarKendaraanDinas}
            path="/kendaraan/daftar-kendaraan"
            exact
            roleRoute={[5, 8]}
          />
          <ProtectedRoute
            component={KendaraanSaya}
            path="/kendaraan/kendaraan-saya"
            exact
            roleRoute={[9, 5]}
          />
          <ProtectedRoute
            component={PerjalananKendaraanDinas}
            path="/kendaraan/perjalanan"
            exact
            roleRoute={[5, 8]}
          />
          <ProtectedRoute
            component={DetailkendaraanDinas}
            path="/perjalanan/detail-kendaraan-dinas/:id"
            exact
            roleRoute={[5, 1]}
          />
          <ProtectedRoute
            component={DaftarPerjalananKendaraan}
            path="/kendaraan/daftar-perjalanan-kendaraan"
            exact
            roleRoute={[5, 1]}
          />
          {/* ///////////////BARJAS/////////////////// */}
          <ProtectedRoute
            component={DaftarDokumen}
            path="/barjas/daftar-dokumen-sp"
            exact
            roleRoute={[5, 1]}
          />
          <ProtectedRoute
            component={DetailSP}
            path="/barjas/detail-sp/:id"
            exact
            roleRoute={[5, 1]}
          />
          <ProtectedRoute
            component={JenisDokumenBarjas}
            path="/barjas/jenis-dokumen"
            exact
            roleRoute={[5, 1]}
          />
          <ProtectedRoute
            component={NomorSPBarjas}
            path="/barjas/nomor-sp"
            exact
            roleRoute={[5, 1]}
          />
          <ProtectedRoute
            component={PengaturanBarjas}
            path="/barjas/pengaturan"
            exact
            roleRoute={[5, 1]}
          />
          {/* ///////////////////KEUANGAN//////////////////////////// */}
          <ProtectedRoute
            component={templateBPD}
            path="/unit-kerja/template-bpd"
            exact
            roleRoute={[5, 2]}
          />
          <ProtectedRoute
            component={DalamKota}
            path="/unit-kerja/dalam-kota"
            exact
            roleRoute={[2, 5]}
          />
          <ProtectedRoute
            component={templateBPDKeuangan}
            path="/keuangan/template-bpd"
            exact
            roleRoute={[5, 3]}
          />
          {/* //////////////////PJPL////////////////////// */}
          <ProtectedRoute
            component={DetailKontrakPJPL}
            path="/admin-pegawai/detail-kontrak/:id"
            exact
            roleRoute={[5, 1]}
          />
          <ProtectedRoute
            component={PejabatVerifikator}
            path="/admin-pegawai/pejabat-verifikator"
            exact
            roleRoute={[5, 7]}
          />
          <ProtectedRoute
            component={KontrakPJPL}
            path="/admin-pegawai/kontrak-PJPL"
            exact
            roleRoute={[5, 1]}
          />
          <ProtectedRoute
            component={IndikatorKualitatifPJPL}
            path="/admin-pegawai/indikator-kualitatif-pjpl"
            exact
            roleRoute={[5, 1]}
          />
          <ProtectedRoute
            component={KinerjaPJPL}
            path="/kepegawaian-PJPL/kinerja-PJPL"
            exact
            roleRoute={[5, 1, 9]}
          />
          <ProtectedRoute
            component={DetailKinerjaPJPL}
            path="/kepegawaian/detail/kinerja/:id"
            exact
            roleRoute={[5, 1, 9]}
          />
          <ProtectedRoute
            component={HasilKerjaPJPL}
            path="/kepegawaian/hasil-kerja-pjpl/:id"
            exact
            roleRoute={[5, 1, 9]}
          />
          <ProtectedRoute
            component={DaftarLaporanPJPL}
            path="/kepegawaian/daftar-laporan-pjpl"
            exact
            roleRoute={[5, 1, 9]}
          />
          <ProtectedRoute
            component={AtasanDaftarKontrak}
            path="/kepegawaian-ASN/atasan/daftar-kontrak"
            exact
            roleRoute={[5, 1, 9]}
          />
          <ProtectedRoute
            component={AtasanDetailKontrak}
            path="/kepegawaian-ASN/atasan/kontrak/:id"
            exact
            roleRoute={[5, 1, 9]}
          />
          <ProtectedRoute
            component={PenilaianAtasan}
            path="/kepegawaian-ASN/atasan/penilaian/:id"
            exact
            roleRoute={[5, 1, 9]}
          />
          <ProtectedRoute
            component={DashboardKeuangan}
            path="/keuangan/dashboard"
            exact
            roleRoute={[3, 5]}
          />
          {/* /////////////////////APLIKASI_PJLP////////////////////// */}
          <ProtectedRoute
            component={VerifikasiRencanaAksiKerja}
            path="/sistem-PJLP/verifikasi-rencana-aksi-kerja"
            exact
            roleRoute={[5, 1, 9]}
          />
          <Route component={LoginPegawai} path="/pegawai/login" />
          <Route component={verifikasi} path="/verifikasi/:id" />
          <Route component={DeveloperProfile} path="/developer-profile" />
          <Route component={Home} path="/" />
        </Switch>
      </BrowserRouter>
    </>
  );
}

export default App;

// cek kolaborasi
