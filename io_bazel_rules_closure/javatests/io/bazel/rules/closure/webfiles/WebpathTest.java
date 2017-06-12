// Copyright 2016 The Closure Rules Authors. All Rights Reserved.
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

package io.bazel.rules.closure.webfiles;

import static com.google.common.truth.Truth.assertThat;

import com.google.common.testing.EqualsTester;
import com.google.common.testing.NullPointerTester;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;

/** Unit tests for {@link Webpath}. */
@RunWith(JUnit4.class)
public class WebpathTest {

  @Test
  public void imageInSameDirectory_canBeTurnedIntoAbsolutePath() throws Exception {
    assertThat(Webpath.get("/foo/bar.html").lookup(Webpath.get("omg.png")))
        .isEqualTo(Webpath.get("/foo/omg.png"));
  }

  @Test
  public void imageInSubdirectory_canBeTurnedIntoAbsolutePath() throws Exception {
    assertThat(Webpath.get("/foo/bar.html").lookup(Webpath.get("a/omg.png")))
        .isEqualTo(Webpath.get("/foo/a/omg.png"));
  }

  @Test
  public void imageInParentDirectory_removesDots() throws Exception {
    assertThat(Webpath.get("/foo/bar.html").lookup(Webpath.get("../omg.png")))
        .isEqualTo(Webpath.get("/omg.png"));
  }

  @Test
  public void absolutePath_doesNotResolve() throws Exception {
    assertThat(Webpath.get("/foo/bar.html").lookup(Webpath.get("/a/b/omg.png")))
        .isEqualTo(Webpath.get("/a/b/omg.png"));
  }

  @Test
  public void testEquals() throws Exception {
    new EqualsTester()
        .addEqualityGroup(Webpath.get("a"), Webpath.get("a"))
        .addEqualityGroup(Webpath.get("b"))
        .addEqualityGroup(Webpath.get("a/b"))
        .addEqualityGroup(Webpath.get("/a"))
        .testEquals();
  }

  @Test
  public void testNulls() throws Exception {
    NullPointerTester tester = new NullPointerTester();
    tester.testAllPublicStaticMethods(Webpath.class);
    tester.testAllPublicInstanceMethods(Webpath.get("a"));
  }
}
