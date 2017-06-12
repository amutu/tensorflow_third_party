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

load("//closure/templates:closure_java_template_library.bzl", "closure_java_template_library")

licenses(["notice"])  # Apache 2.0

java_binary(
    name = "server",
    srcs = [
        "MimeTypes.java",
        "NetworkUtils.java",
        "WebfilesServer.java",
    ],
    main_class = "io.bazel.rules.closure.webfiles.server.WebfilesServer",
    resources = ["invisible_college.ansi"],
    visibility = ["//visibility:public"],
    deps = [
        ":listing",
        "//closure/templates",
        "//java/io/bazel/rules/closure/webfiles",
        "//java/io/bazel/rules/closure/webfiles:build_info_java_proto",
        "@com_google_code_findbugs_jsr305",
        "@com_google_guava",
        "@com_google_protobuf_java",
        "@org_apache_tomcat_servlet_api",
        "@org_mortbay_jetty",
    ],
)

closure_java_template_library(
    name = "listing",
    srcs = ["listing.soy"],
)
