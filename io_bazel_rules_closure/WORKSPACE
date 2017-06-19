workspace(name = "io_bazel_rules_closure")

load("//closure/private:java_import_external.bzl", "java_import_external")
load("//closure:repositories.bzl", "closure_repositories")

closure_repositories()

java_import_external(
    name = "com_google_guava_testlib",
    jar_sha256 = "a9f52f328ac024e420c8995a107ea0dbef3fc169ddf97b3426e634f28d6b3663",
    jar_urls = [
        "http://bazel-mirror.storage.googleapis.com/repo1.maven.org/maven2/com/google/guava/guava-testlib/20.0/guava-testlib-20.0.jar",
        "http://repo1.maven.org/maven2/com/google/guava/guava-testlib/20.0/guava-testlib-20.0.jar",
        "http://maven.ibiblio.org/maven2/com/google/guava/guava-testlib/20.0/guava-testlib-20.0.jar",
    ],
    licenses = ["notice"],  # Apache 2.0
    testonly_ = 1,
    deps = ["@com_google_guava"],
)

java_import_external(
    name = "com_google_jimfs",
    jar_sha256 = "c4828e28d7c0a930af9387510b3bada7daa5c04d7c25a75c7b8b081f1c257ddd",
    jar_urls = [
        "http://bazel-mirror.storage.googleapis.com/repo1.maven.org/maven2/com/google/jimfs/jimfs/1.1/jimfs-1.1.jar",
        "http://repo1.maven.org/maven2/com/google/jimfs/jimfs/1.1/jimfs-1.1.jar",
        "http://maven.ibiblio.org/maven2/com/google/jimfs/jimfs/1.1/jimfs-1.1.jar",
    ],
    licenses = ["notice"],  # Apache 2.0
    testonly_ = 1,
    deps = ["@com_google_guava"],
)

java_import_external(
    name = "junit",
    jar_sha256 = "90a8e1603eeca48e7e879f3afbc9560715322985f39a274f6f6070b43f9d06fe",
    jar_urls = [
        "http://bazel-mirror.storage.googleapis.com/repo1.maven.org/maven2/junit/junit/4.11/junit-4.11.jar",
        "http://repo1.maven.org/maven2/junit/junit/4.11/junit-4.11.jar",
        "http://maven.ibiblio.org/maven2/junit/junit/4.11/junit-4.11.jar",
    ],
    licenses = ["reciprocal"],  # Common Public License 1.0
    testonly_ = 1,
    deps = ["@org_hamcrest_core"],
)

java_import_external(
    name = "org_hamcrest_core",
    jar_sha256 = "66fdef91e9739348df7a096aa384a5685f4e875584cce89386a7a47251c4d8e9",
    jar_urls = [
        "http://bazel-mirror.storage.googleapis.com/repo1.maven.org/maven2/org/hamcrest/hamcrest-core/1.3/hamcrest-core-1.3.jar",
        "http://repo1.maven.org/maven2/org/hamcrest/hamcrest-core/1.3/hamcrest-core-1.3.jar",
        "http://maven.ibiblio.org/maven2/org/hamcrest/hamcrest-core/1.3/hamcrest-core-1.3.jar",
    ],
    licenses = ["notice"],  # BSD
    testonly_ = 1,
)

java_import_external(
    name = "org_mockito_all",
    jar_sha256 = "d1a7a7ef14b3db5c0fc3e0a63a81b374b510afe85add9f7984b97911f4c70605",
    jar_urls = [
        "http://bazel-mirror.storage.googleapis.com/repo1.maven.org/maven2/org/mockito/mockito-all/1.10.19/mockito-all-1.10.19.jar",
        "http://repo1.maven.org/maven2/org/mockito/mockito-all/1.10.19/mockito-all-1.10.19.jar",
        "http://maven.ibiblio.org/maven2/org/mockito/mockito-all/1.10.19/mockito-all-1.10.19.jar",
    ],
    licenses = ["notice"],  # MIT
    testonly_ = 1,
    deps = [
        "@junit",
        "@org_hamcrest_core",
    ],
)

java_import_external(
    name = "com_google_truth",
    jar_sha256 = "032eddc69652b0a1f8d458f999b4a9534965c646b8b5de0eba48ee69407051df",
    jar_urls = [
        "http://bazel-mirror.storage.googleapis.com/repo1.maven.org/maven2/com/google/truth/truth/0.32/truth-0.32.jar",
        "http://repo1.maven.org/maven2/com/google/truth/truth/0.32/truth-0.32.jar",
    ],
    licenses = ["notice"],  # Apache 2.0
    testonly_ = 1,
    deps = ["@com_google_guava"],
)
