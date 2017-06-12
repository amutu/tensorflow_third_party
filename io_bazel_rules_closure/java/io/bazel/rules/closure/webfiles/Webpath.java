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

import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Web server path.
 *
 * <p>This is a delegate for {@link Path} which implements the label granularity we want. We could
 * have just used the {@code Path} class for web server paths too, but then the type wouldn't be
 * distinguishable, thereby harming readability.
 */
public final class Webpath implements Comparable<Webpath> {

  /** Creates new instance. */
  public static Webpath get(String path) {
    return new Webpath(Paths.get(path));
  }

  private final Path path;

  private Webpath(Path path) {
    this.path = path;
  }

  /** Returns encapsulated path object. */
  public Path getPath() {
    return path;
  }

  /** Returns absolute path of {@code reference} relative to {@code file}. */
  public Webpath lookup(Webpath reference) {
    return getParent().resolve(reference).normalize();
  }

  /** Delegates to {@link Path#isAbsolute()}. */
  public boolean isAbsolute() {
    return path.isAbsolute();
  }

  /** Delegates to {@link Path#getParent()}. */
  public Webpath getParent() {
    return new Webpath(path.getParent());
  }

  /** Delegates to {@link Path#normalize()}. */
  public Webpath normalize() {
    return new Webpath(path.normalize());
  }

  /** Delegates to {@link Path#resolve(Path)}. */
  public Webpath resolve(Webpath other) {
    return new Webpath(path.resolve(other.path));
  }

  /** Delegates to {@link Path#startsWith(Path)}. */
  public boolean startsWith(Webpath other) {
    return path.startsWith(other.path);
  }

  /** Delegates to {@link Path#getNameCount()}. */
  public int getNameCount() {
    return path.getNameCount();
  }

  /** Delegates to {@link Path#subpath(int, int)}. */
  public Webpath subpath(int start, int end) {
    return new Webpath(path.subpath(start, end));
  }

  @Override
  public int hashCode() {
    return path.hashCode();
  }

  @Override
  public boolean equals(Object other) {
    return this == other
        || other instanceof Webpath
        && path.equals(((Webpath) other).path);
  }

  @Override
  public int compareTo(Webpath other) {
    return path.compareTo(other.path);
  }

  @Override
  public String toString() {
    return path.toString();
  }
}
