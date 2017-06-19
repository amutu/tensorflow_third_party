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

import static com.google.common.truth.Truth.assertThat;
import static org.mockito.Matchers.any;
import static org.mockito.Matchers.anyInt;
import static org.mockito.Matchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

import com.google.common.net.HostAndPort;
import java.net.BindException;
import java.net.InetAddress;
import java.net.ServerSocket;
import javax.net.ServerSocketFactory;
import org.junit.Assert;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.ExpectedException;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;

/** Unit tests for {@link NetworkUtils}. */
@RunWith(JUnit4.class)
public class NetworkUtilsTest {

  private final ServerSocket serverSocket = mock(ServerSocket.class);
  private final ServerSocketFactory serverSocketFactory = mock(ServerSocketFactory.class);
  private final NetworkUtils networkUtils = new NetworkUtils(serverSocketFactory);

  @Rule public final ExpectedException thrown = ExpectedException.none();

  @Test
  public void createServerSocket_succeeds_doesntRetry() throws Exception {
    when(serverSocketFactory.createServerSocket(anyInt(), anyInt(), any(InetAddress.class)))
        .thenReturn(serverSocket);
    assertThat(networkUtils.createServerSocket(HostAndPort.fromParts("127.0.0.1", 80), true))
        .isSameAs(serverSocket);
    verify(serverSocketFactory)
        .createServerSocket(
            eq(80), anyInt(), eq(InetAddress.getByAddress(new byte[] {127, 0, 0, 1})));
    verifyNoMoreInteractions(serverSocketFactory);
  }

  @Test
  public void createServerSocket_bindFailsAndThenSucceeds_retries() throws Exception {
    when(serverSocketFactory.createServerSocket(anyInt(), anyInt(), any(InetAddress.class)))
        .thenThrow(new BindException())
        .thenReturn(serverSocket);
    assertThat(networkUtils.createServerSocket(HostAndPort.fromParts("127.0.0.1", 80), true))
        .isSameAs(serverSocket);
    verify(serverSocketFactory)
        .createServerSocket(
            eq(80), anyInt(), eq(InetAddress.getByAddress(new byte[] {127, 0, 0, 1})));
    verify(serverSocketFactory)
        .createServerSocket(
            eq(81), anyInt(), eq(InetAddress.getByAddress(new byte[] {127, 0, 0, 1})));
    verifyNoMoreInteractions(serverSocketFactory);
  }

  @Test
  public void createServerSocket_bindRepeatedlyFails_eventuallyGivesUp() throws Exception {
    when(serverSocketFactory.createServerSocket(anyInt(), anyInt(), any(InetAddress.class)))
        .thenThrow(new BindException());
    thrown.expect(BindException.class);
    networkUtils.createServerSocket(HostAndPort.fromParts("127.0.0.1", 80), true);
  }

  @Test
  public void createServerSocket_portIsZeroAndFails_doesntRetry() throws Exception {
    when(serverSocketFactory.createServerSocket(anyInt(), anyInt(), any(InetAddress.class)))
        .thenThrow(new BindException());
    try {
      networkUtils.createServerSocket(HostAndPort.fromParts("127.0.0.1", 0), true);
      Assert.fail("Wanted BindException");
    } catch (BindException ignored) {
      // expected
    }
    verify(serverSocketFactory)
        .createServerSocket(
            eq(0), anyInt(), eq(InetAddress.getByAddress(new byte[] {127, 0, 0, 1})));
    verifyNoMoreInteractions(serverSocketFactory);
  }
}
