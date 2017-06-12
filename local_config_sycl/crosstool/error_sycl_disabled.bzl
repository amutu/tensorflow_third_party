
def error_sycl_disabled():
  fail("ERROR: Building with --config=sycl but TensorFlow is not configured " +
       "to build with SYCL support. Please re-run ./configure and enter 'Y' " +
       "at the prompt to build with SYCL support.")

  native.genrule(
      name = "error_gen_crosstool",
      outs = ["CROSSTOOL"],
      cmd = "echo 'Should not be run.' && exit 1",
  )

  native.filegroup(
      name = "crosstool",
      srcs = [":CROSSTOOL"],
      output_licenses = ["unencumbered"],
  )
