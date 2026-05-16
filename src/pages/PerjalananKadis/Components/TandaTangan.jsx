// src/pages/PerjalananKadis/Components/TandaTangan.jsx
import React from "react";
import {
  Box,
  Heading,
  HStack,
  Container,
  FormControl,
  FormLabel,
  SimpleGrid,
} from "@chakra-ui/react";
import { Select as Select2 } from "chakra-react-select";

const TandaTangan = ({ dataSeed, state, actions, user }) => {
  return (
    <Container
      maxW={"1280px"}
      variant={"primary"}
      pt={"30px"}
      ps={"0px"}
      mb={"30px"}
    >
      <HStack mb={"20px"}>
        <Box
          bgColor={"primary"}
          width={"30px"}
          height={"30px"}
          borderRadius={"4px"}
        ></Box>
        <Heading color={"primary"} fontSize={"28px"} fontWeight={"600"}>
          Daftar Tanda Tangan
        </Heading>
      </HStack>
      <SimpleGrid columns={2} spacing={6} p={"30px"}>
        <FormControl border={0} flex="1" mb={"20px"}>
          <FormLabel fontSize={"20px"} fontWeight={"500"} mb={"10px"}>
            Tanda Tangan Nota Dinas
          </FormLabel>
          <Select2
            options={
              dataSeed?.resultTtdNotaDinas?.map((val) => ({
                value: val,
                label: `${val?.pegawai_notaDinas?.nama}`,
              })) || []
            }
            placeholder="Ttd Nota Dinas"
            focusBorderColor="red"
            value={state.dataTtdNotaDinas}
            onChange={actions.setDataTtdNotaDinas}
            components={{
              DropdownIndicator: () => null,
              IndicatorSeparator: () => null,
            }}
            chakraStyles={{
              container: (provided) => ({
                ...provided,
                borderRadius: "6px",
              }),
              control: (provided) => ({
                ...provided,
                backgroundColor: "terang",
                border: "0px",
                height: "60px",
                _hover: {
                  borderColor: "yellow.700",
                },
                minHeight: "40px",
              }),
              option: (provided, state) => ({
                ...provided,
                bg: state.isFocused ? "primary" : "white",
                color: state.isFocused ? "white" : "black",
              }),
            }}
          />
        </FormControl>

        <FormControl border={0} flex="1" mb={"20px"}>
          <FormLabel fontSize={"20px"} fontWeight={"500"} mb={"10px"}>
            Tanda tangan Surat Tugas
          </FormLabel>
          <Select2
            options={(() => {
              const uniqueIndukUnitKerjaIds = [
                ...new Set(
                  dataSeed?.resultTtdSuratTugas?.map(
                    (item) => item.indukUnitKerjaId
                  ) || []
                ),
              ];

              return uniqueIndukUnitKerjaIds.map((id) => ({
                label:
                  id === 1
                    ? "Dinas Kesehatan"
                    : id === user[0]?.unitKerja_profile.indukUnitKerja.id
                    ? user[0]?.unitKerja_profile.indukUnitKerja.indukUnitKerja
                    : `Unit Kerja ${id}`,
                options:
                  dataSeed?.resultTtdSuratTugas
                    ?.filter((val) => val.indukUnitKerjaId === id)
                    .map((val) => ({
                      value: val,
                      label: `${val?.pegawai?.nama} (${val.jabatan})`,
                    })) || [],
              }));
            })()}
            placeholder="Ttd Surat Tugas"
            focusBorderColor="red"
            value={state.dataTtdSuratTugas}
            onChange={actions.setDataTtdSuratTugas}
            components={{
              DropdownIndicator: () => null,
              IndicatorSeparator: () => null,
            }}
            chakraStyles={{
              container: (provided) => ({
                ...provided,
                borderRadius: "6px",
              }),
              control: (provided) => ({
                ...provided,
                backgroundColor: "terang",
                border: "0px",
                height: "60px",
                _hover: {
                  borderColor: "yellow.700",
                },
                minHeight: "40px",
              }),
              option: (provided, state) => ({
                ...provided,
                bg: state.isFocused ? "primary" : "white",
                color: state.isFocused ? "white" : "black",
              }),
            }}
          />
        </FormControl>

        <FormControl border={0} flex="1" mb={"20px"}>
          <FormLabel fontSize={"20px"} fontWeight={"500"} mb={"10px"}>
            Tanda Tangan Pengguna Anggaran
          </FormLabel>
          <Select2
            options={
              dataSeed?.resultKPA?.map((val) => ({
                value: val,
                label: `${val?.pegawai_KPA?.nama}`,
              })) || []
            }
            placeholder="Kuasa Pengguna Anggaran"
            focusBorderColor="red"
            value={state.dataKPA}
            onChange={actions.setDataKPA}
            components={{
              DropdownIndicator: () => null,
              IndicatorSeparator: () => null,
            }}
            chakraStyles={{
              container: (provided) => ({
                ...provided,
                borderRadius: "6px",
              }),
              control: (provided) => ({
                ...provided,
                backgroundColor: "terang",
                border: "0px",
                height: "60px",
                _hover: {
                  borderColor: "yellow.700",
                },
                minHeight: "40px",
              }),
              option: (provided, state) => ({
                ...provided,
                bg: state.isFocused ? "primary" : "white",
                color: state.isFocused ? "white" : "black",
              }),
            }}
          />
        </FormControl>

        <FormControl border={0} flex="1" mb={"20px"}>
          <FormLabel fontSize={"20px"} fontWeight={"500"} mb={"10px"}>
            Tanda Tangan PPTK
          </FormLabel>
          <Select2
            options={
              dataSeed?.resultPPTK?.map((val) => ({
                value: val,
                label: `${val?.pegawai_PPTK?.nama}`,
              })) || []
            }
            placeholder="PPTK"
            focusBorderColor="red"
            value={state.dataPPTK}
            onChange={actions.setDataPPTK}
            components={{
              DropdownIndicator: () => null,
              IndicatorSeparator: () => null,
            }}
            chakraStyles={{
              container: (provided) => ({
                ...provided,
                borderRadius: "6px",
              }),
              control: (provided) => ({
                ...provided,
                backgroundColor: "terang",
                border: "0px",
                height: "60px",
                _hover: {
                  borderColor: "yellow.700",
                },
                minHeight: "40px",
              }),
              option: (provided, state) => ({
                ...provided,
                bg: state.isFocused ? "primary" : "white",
                color: state.isFocused ? "white" : "black",
              }),
            }}
          />
        </FormControl>
      </SimpleGrid>
    </Container>
  );
};

export default TandaTangan;
