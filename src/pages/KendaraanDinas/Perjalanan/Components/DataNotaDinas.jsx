// src/pages/Perjalanan/components/DataNotaDinas.jsx
import React from "react";
import {
  Box,
  Heading,
  HStack,
  Container,
  FormControl,
  FormLabel,
  Textarea,
  Checkbox,
  Select,
  Flex,
  FormErrorMessage,
} from "@chakra-ui/react";
import { Select as Select2 } from "chakra-react-select";
import { useFormikContext } from "formik";

const DataNotaDinas = ({ dataSeed, state, actions, dataKlasifikasi }) => {
  const { values, errors, touched, setFieldValue } = useFormikContext();

  return (
    <Container maxW={"1280px"} variant={"primary"} pt={"30px"} ps={"0px"}>
      <HStack>
        <Box bgColor={"primary"} width={"30px"} height={"30px"}></Box>
        <Heading color={"primary"}>Data Surat Pengantar</Heading>
      </HStack>
      <Box p={"30px"}>
        <FormControl
          my={"30px"}
          isInvalid={touched.klasifikasi && errors.klasifikasi}
        >
          <FormLabel fontSize={"24px"}>Klasifikasi</FormLabel>
          <Select2
            name="klasifikasi"
            options={dataSeed.resultKlasifikasi?.map((val) => ({
              value: val,
              label: `${val.kode}-${val.namaKlasifikasi}`,
            }))}
            placeholder="Cari Klasifikasi"
            value={values.klasifikasi}
            onChange={(selectedOption) => {
              setFieldValue("klasifikasi", selectedOption);
              actions.setKlasifikasi(selectedOption);
              actions.fetchDataKodeKlasifikasi(selectedOption.value.id);
            }}
            components={{
              DropdownIndicator: () => null,
              IndicatorSeparator: () => null,
            }}
            chakraStyles={{
              container: (provided) => ({ ...provided, borderRadius: "6px" }),
              control: (provided) => ({
                ...provided,
                backgroundColor: "terang",
                border: "0px",
                height: "60px",
                _hover: { borderColor: "yellow.700" },
                minHeight: "40px",
              }),
              option: (provided, state) => ({
                ...provided,
                bg: state.isFocused ? "primary" : "white",
                color: state.isFocused ? "white" : "black",
              }),
            }}
          />
          <FormErrorMessage>{errors.klasifikasi}</FormErrorMessage>
        </FormControl>

        {dataKlasifikasi[0] && (
          <FormControl
            my={"30px"}
            isInvalid={touched.kodeKlasifikasi && errors.kodeKlasifikasi}
          >
            <FormLabel fontSize={"24px"}>Kode Klasifikasi</FormLabel>
            <Select2
              name="kodeKlasifikasi"
              options={dataKlasifikasi.map((val) => ({
                value: val,
                label: `${val.kode} - ${val.kegiatan}`,
              }))}
              placeholder="Pilih Klasifikasi"
              value={values.kodeKlasifikasi}
              onChange={(selectedOption) => {
                setFieldValue("kodeKlasifikasi", selectedOption);
                actions.setDataKodeKlasifikasi(selectedOption);
              }}
              components={{
                DropdownIndicator: () => null,
                IndicatorSeparator: () => null,
              }}
              chakraStyles={{
                container: (provided) => ({ ...provided, borderRadius: "6px" }),
                control: (provided) => ({
                  ...provided,
                  backgroundColor: "terang",
                  border: "0px",
                  height: "60px",
                  _hover: { borderColor: "yellow.700" },
                  minHeight: "40px",
                }),
                option: (provided, state) => ({
                  ...provided,
                  bg: state.isFocused ? "primary" : "white",
                  color: state.isFocused ? "white" : "black",
                }),
              }}
            />
            <FormErrorMessage>{errors.kodeKlasifikasi}</FormErrorMessage>
          </FormControl>
        )}

        <FormControl my={"30px"} isInvalid={touched.untuk && errors.untuk}>
          <FormLabel fontSize={"24px"}>Untuk</FormLabel>
          <Textarea
            name="untuk"
            value={values.untuk}
            onChange={(e) => {
              setFieldValue("untuk", e.target.value);
              actions.setUntuk(e.target.value);
            }}
            placeholder="isi dengan tujuan perjalanan dinas"
            backgroundColor={"terang"}
            p={"20px"}
            minHeight={"160px"}
          />
          <FormErrorMessage>{errors.untuk}</FormErrorMessage>
        </FormControl>

        <FormControl my={"30px"}>
          <FormLabel fontSize={"24px"}>Dasar</FormLabel>
          <Textarea
            name="dasar"
            value={values.dasar}
            onChange={(e) => {
              actions.setDasar(e.target.value);
            }}
            placeholder="isi dengan telaah staff atau undangan"
            backgroundColor={"terang"}
            p={"20px"}
            minHeight={"160px"}
          />
        </FormControl>
        <FormControl my={"30px"}>
          <FormLabel fontSize={"24px"}>Jenis </FormLabel>
          <Select
            mt="10px"
            border="1px"
            height={"60px"}
            borderRadius={"8px"}
            borderColor={"rgba(229, 231, 235, 1)"}
            onChange={(e) => actions.setIsNotaDinas(parseInt(e.target.value))}
          >
            <option value="1">Nota Dinas</option>
            <option value="0">Telaahan Staf</option>{" "}
            <option value="2">Undangan</option>
          </Select>
        </FormControl>
        <Flex gap={4}>
          <Checkbox
            isChecked={state.isSrikandi === 0}
            onChange={(e) => actions.setIsSrikandi(e.target.checked ? 0 : 1)}
          >
            Srikandi
          </Checkbox>
        </Flex>
        {JSON.stringify(state.isNotaDinas)}
      </Box>
    </Container>
  );
};

export default DataNotaDinas;
