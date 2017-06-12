/*
 * Copyright 2016 The Closure Rules Authors. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package io.bazel.rules.closure;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.Iterables;
import com.google.javascript.jscomp.JsChecker;
import com.google.javascript.jscomp.JsCompiler;
import dagger.Component;
import dagger.Module;
import dagger.Provides;
import io.bazel.rules.closure.BazelWorker.Mnemonic;
import io.bazel.rules.closure.program.CommandLineProgram;
import io.bazel.rules.closure.webfiles.WebfilesValidatorProgram;
import java.io.PrintStream;
import java.nio.file.FileSystem;
import java.nio.file.FileSystems;
import javax.inject.Inject;
import javax.inject.Provider;

/** Bazel worker for all Closure Tools programs, some of which are modded. */
public final class ClosureWorker implements CommandLineProgram {

  private final PrintStream output;
  private final Provider<WebfilesValidatorProgram> webfilesValidator;

  @Inject
  ClosureWorker(PrintStream output, Provider<WebfilesValidatorProgram> webfilesValidator) {
    this.output = output;
    this.webfilesValidator = webfilesValidator;
  }

  @Override
  public Integer apply(Iterable<String> args) {
    String head = Iterables.getFirst(args, "");
    Iterable<String> tail = Iterables.skip(args, 1);
    // TODO(jart): Include Closure Templates and Stylesheets.
    switch (head) {
      case "JsChecker":
        return new JsChecker.Program().apply(tail);
      case "JsCompiler":
        return new JsCompiler().apply(tail);
      case "WebfilesValidator":
        return webfilesValidator.get().apply(tail);
      default:
        output.println(
            "\nERROR: First flag to ClosureWorker should be specific compiler to run, "
                + "e.g. JsChecker\n");
        return 1;
    }
  }

  @Module
  static class Config {

    @Provides
    @Mnemonic
    static String provideMnemonic() {
      return "Closure";
    }

    @Provides
    static PrintStream provideOutput() {
      return System.err;
    }

    @Provides
    static FileSystem provideFileSystem() {
      return FileSystems.getDefault();
    }
  }

  @Component(modules = Config.class)
  interface Server {
    BazelWorker<ClosureWorker> worker();
  }

  public static void main(String[] args) {
    System.exit(DaggerClosureWorker_Server.create().worker().apply(ImmutableList.copyOf(args)));
  }
}
