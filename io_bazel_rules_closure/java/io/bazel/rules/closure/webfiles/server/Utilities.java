// Copyright 2017 The Closure Rules Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package io.bazel.rules.closure.webfiles.server;

import static java.nio.charset.StandardCharsets.UTF_8;

import com.google.protobuf.TextFormat;
import io.bazel.rules.closure.webfiles.BuildInfo.Webfiles;
import io.bazel.rules.closure.webfiles.server.BuildInfo.WebfilesServerInfo;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

final class Utilities {

  static WebfilesServerInfo loadParamsPbtxt(Path path) throws IOException {
    WebfilesServerInfo.Builder build = WebfilesServerInfo.newBuilder();
    TextFormat.getParser().merge(new String(Files.readAllBytes(path), UTF_8), build);
    return build.build();
  }

  static Webfiles loadWebfilesPbtxt(Path path) throws IOException {
    Webfiles.Builder build = Webfiles.newBuilder();
    TextFormat.getParser().merge(new String(Files.readAllBytes(path), UTF_8), build);
    return build.build();
  }

  private Utilities() {}
}
