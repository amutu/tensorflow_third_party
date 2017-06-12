# Copyright 2016 The Closure Rules Authors. All rights reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

load("//closure/private:java_proto_library.bzl", "java_proto_library")

licenses(["notice"])  # Apache 2.0

java_binary(
    name = "ClosureWorker",
    srcs = [
        "BazelWorker.java",
        "ClosureWorker.java",
    ],
    main_class = "io.bazel.rules.closure.ClosureWorker",
    visibility = ["//visibility:public"],
    deps = [
        ":worker_protocol_java_proto",
        "//java/com/google/javascript/jscomp",
        "//java/io/bazel/rules/closure/program",
        "//java/io/bazel/rules/closure/webfiles",
        "@com_google_dagger",
        "@com_google_guava",
        "@javax_inject",
    ],
)

java_library(
    name = "tarjan",
    srcs = ["Tarjan.java"],
    visibility = ["//visibility:public"],
    deps = ["@com_google_guava"],
)

java_proto_library(
    name = "build_info_java_proto",
    src = "build_info.proto",
    visibility = ["//visibility:public"],
)

java_proto_library(
    name = "worker_protocol_java_proto",
    src = "worker_protocol.proto",
)
