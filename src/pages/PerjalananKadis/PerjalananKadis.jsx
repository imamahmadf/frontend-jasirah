// --- PerjalananKadis.jsx ---

import React from "react";
import { Box, Container, useToast, Center, Button } from "@chakra-ui/react";
import { useSelector } from "react-redux";
import { userRedux } from "../../Redux/Reducers/auth";
import { useHistory } from "react-router-dom";
import Layout from "../../Componets/Layout";
import Loading from "../../Componets/Loading";
import usePerjalananKadisData from "./hooks/usePerjalananKadisData";
import DataNotaDinas from "./Components/DataNotaDinas";
import DaftarPersonil from "./Components/DaftarPersonil";
import TandaTangan from "./Components/TandaTangan";
import DataKeuangan from "./Components/DataKeuangan";
import DataPerjalanan from "./Components/DataPerjalanan";
import PreviewPersonil from "./Components/PreviewPersonil";
import SubmitButton from "./Components/SubmitButton";
import { Formik, Form } from "formik";
import * as Yup from "yup";

function PerjalananKadis() {
  const user = useSelector(userRedux);
  const history = useHistory();
  const toast = useToast();

  const {
    state,
    actions,
    isLoading,
    dataTemplate,
    selectedPegawai,
    dataSeed,
    dataKota,
    perjalananKota,
  } = usePerjalananKadisData(user);

  if (isLoading) return <Loading />;

  if (!dataTemplate.templateNotaDinas) {
    return (
      <Box bgColor={"secondary"} pb={"40px"} px={"30px"}>
        <Container variant={"primary"} maxW={"1280px"} p={"30px"}>
          <Center minH={"80vh"}>
            <Button
              onClick={() => history.push("/admin/template")}
              variant={"primary"}
            >
              Upload Template Surat
            </Button>
          </Center>
        </Container>
      </Box>
    );
  }

  const initialValues = {
    klasifikasi: null,
    kodeKlasifikasi: null,
    subKegiatan: null,
    untuk: "",
    dasar: state.dasar ?? "",
    pengajuan: "",
    asal: state.asal,
    sumberDana: null,
    bendahara: null,
    personil: [null],
    jenisPerjalanan: null,
  };

  const validationSchema = Yup.object().shape({
    klasifikasi: Yup.mixed().nullable().required("Klasifikasi wajib diisi"),
    kodeKlasifikasi: Yup.mixed()
      .nullable()
      .required("Kode Klasifikasi wajib diisi"),
    jenisPerjalanan: Yup.mixed()
      .nullable()
      .required("Jenis Perjalanan wajib diisi"),
    untuk: Yup.string().required("Untuk wajib diisi"),
    asal: Yup.string().required("Asal wajib diisi"),
    pengajuan: Yup.string()
      .nullable()
      .required("Tanggal pengajuan wajib diisi")
      .matches(
        /^\d{4}-\d{2}-\d{2}$/,
        "Format tanggal tidak valid (YYYY-MM-DD)"
      ),
    sumberDana: Yup.mixed().nullable().required("Sumber Dana wajib dipilih"),
    bendahara: Yup.mixed().nullable().required("Bendahara wajib dipilih"),
    personil: Yup.array()
      .of(Yup.mixed().nullable())
      .test(
        "personil-0-required",
        "Personil 1 wajib dipilih",
        (arr) => arr[0] !== null
      ),
    subKegiatan: Yup.mixed().nullable().required("Sub kegiatan wajib diisi"),
  });

  return (
    <Layout>
      <Box bgColor={"secondary"} pb={"40px"} px={"30px"} pt={"30px"}>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={(values, { setSubmitting }) => {
            console.log("🟢 Form berhasil dikirim:", values);
            actions.submitPerjalanan(values);
            setSubmitting(false);
          }}
        >
          {({ isSubmitting, values, errors, touched, setFieldValue }) => (
            <Form>
              <DataNotaDinas
                dataSeed={dataSeed}
                state={state}
                actions={actions}
                dataKlasifikasi={state.dataKlasifikasi}
                values={values}
                errors={errors}
                touched={touched}
                setFieldValue={setFieldValue}
              />

              <DaftarPersonil
                dataPegawai={state.dataPegawai}
                selectedPegawai={selectedPegawai}
                handleSelectChange={actions.handleSelectChange}
                values={values}
                errors={errors}
                touched={touched}
              />

              <TandaTangan
                dataSeed={dataSeed}
                state={state}
                actions={actions}
                user={user}
              />

              <DataKeuangan
                dataSeed={dataSeed}
                state={state}
                actions={actions}
                values={values}
                errors={errors}
                touched={touched}
              />

              {values.sumberDana && (
                <DataPerjalanan
                  dataSeed={dataSeed}
                  state={state}
                  actions={actions}
                  dataKota={dataKota}
                  perjalananKota={perjalananKota}
                  values={values}
                  errors={errors}
                  touched={touched}
                />
              )}

              {values.personil?.filter(Boolean).length > 0 && (
                <PreviewPersonil />
              )}

              <SubmitButton isLoading={isSubmitting || isLoading} />
            </Form>
          )}
        </Formik>
      </Box>
    </Layout>
  );
}

export default PerjalananKadis;
