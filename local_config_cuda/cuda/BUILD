licenses(["restricted"])  # MPL2, portions GPL v3, LGPL v3, BSD-like

package(default_visibility = ["//visibility:public"])

config_setting(
    name = "using_nvcc",
    values = {
        "define": "using_cuda_nvcc=true",
    },
)

config_setting(
    name = "using_clang",
    values = {
        "define": "using_cuda_clang=true",
    },
)

# Equivalent to using_clang && -c opt.
config_setting(
    name = "using_clang_opt",
    values = {
        "define": "using_cuda_clang=true",
        "compilation_mode": "opt",
    },
)

config_setting(
    name = "darwin",
    values = {"cpu": "darwin"},
    visibility = ["//visibility:public"],
)

config_setting(
    name = "freebsd",
    values = {"cpu": "freebsd"},
    visibility = ["//visibility:public"],
)

cc_library(
    name = "cuda_headers",
    hdrs = [
        "cuda_config.h",
        
    ],
    includes = [
        ".",
        "include",
    ],
    visibility = ["//visibility:public"],
)

cc_library(
    name = "cudart_static",
    srcs = ["lib/libcudart_static.a"],
    includes = ["include"],
    linkopts = select({
        ":freebsd": [],
        "//conditions:default": ["-ldl"],
    }) + [
        "-lpthread",
        "-lrt",
    ],
    visibility = ["//visibility:public"],
)

cc_library(
    name = "cuda_driver",
    srcs = ["lib/libcuda.so"],
    includes = ["include"],
    visibility = ["//visibility:public"],
)

cc_library(
    name = "cudart",
    srcs = ["lib/libcudart.so"],
    data = ["lib/libcudart.so"],
    includes = ["include"],
    linkstatic = 1,
    visibility = ["//visibility:public"],
)

cc_library(
    name = "cublas",
    srcs = ["lib/libcublas.so"],
    data = ["lib/libcublas.so"],
    includes = ["include"],
    linkstatic = 1,
    visibility = ["//visibility:public"],
)

cc_library(
    name = "cusolver",
    srcs = ["lib/libcusolver.so"],
    data = ["lib/libcusolver.so"],
    includes = ["include"],
    linkstatic = 1,
    linkopts = ["-lgomp"],
    visibility = ["//visibility:public"],
)

cc_library(
    name = "cudnn",
    srcs = ["lib/libcudnn.so"],
    data = ["lib/libcudnn.so"],
    includes = ["include"],
    linkstatic = 1,
    visibility = ["//visibility:public"],
)

cc_library(
    name = "cufft",
    srcs = ["lib/libcufft.so"],
    data = ["lib/libcufft.so"],
    includes = ["include"],
    linkstatic = 1,
    visibility = ["//visibility:public"],
)

cc_library(
    name = "curand",
    srcs = ["lib/libcurand.so"],
    data = ["lib/libcurand.so"],
    includes = ["include"],
    linkstatic = 1,
    visibility = ["//visibility:public"],
)

cc_library(
    name = "cuda",
    deps = [
        ":cuda_headers",
        ":cudart",
        ":cublas",
        ":cudnn",
        ":cufft",
        ":curand",
    ],
    visibility = ["//visibility:public"],
)

cc_library(
    name = "cupti_headers",
    hdrs = [
        "cuda_config.h",
        ":cuda-extras",
    ],
    includes = [
        ".",
        "extras/CUPTI/include/",
    ],
    visibility = ["//visibility:public"],
)

cc_library(
    name = "cupti_dsos",
    data = ["lib/libcupti.so"],
    visibility = ["//visibility:public"],
)

cc_library(
    name = "libdevice_root",
    data = [":cuda-nvvm"],
    visibility = ["//visibility:public"],
)


