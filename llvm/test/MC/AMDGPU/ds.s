// RUN: not llvm-mc -arch=amdgcn -show-encoding %s | FileCheck %s --check-prefix=SI --check-prefix=SICI
// RUN: not llvm-mc -arch=amdgcn -mcpu=tahiti  -show-encoding %s | FileCheck %s --check-prefix=SI --check-prefix=SICI
// RUN: not llvm-mc -arch=amdgcn -mcpu=bonaire  -show-encoding %s | FileCheck %s --check-prefix=CI --check-prefix=SICI
// RUN: llvm-mc -arch=amdgcn -mcpu=tonga -show-encoding %s | FileCheck %s --check-prefix=VI

// RUN: not llvm-mc -arch=amdgcn -show-encoding %s 2>&1 | FileCheck %s --check-prefix=NOSI --check-prefix=NOSICI
// RUN: not llvm-mc -arch=amdgcn -mcpu=tahiti  -show-encoding %s 2>&1 | FileCheck %s --check-prefix=NOSI --check-prefix=NOSICI
// RUN: not llvm-mc -arch=amdgcn -mcpu=bonaire  -show-encoding %s 2>&1 | FileCheck %s --check-prefix=NOCI --check-prefix=NOSICI

//===----------------------------------------------------------------------===//
// Checks for 16-bit Offsets
//===----------------------------------------------------------------------===//

ds_add_u32 v2, v4 offset:16
// SICI: ds_add_u32 v2, v4 offset:16 ; encoding: [0x10,0x00,0x00,0xd8,0x02,0x04,0x00,0x00]
// VI:   ds_add_u32 v2, v4 offset:16 ; encoding: [0x10,0x00,0x00,0xd8,0x02,0x04,0x00,0x00]

//===----------------------------------------------------------------------===//
// Checks for 2 8-bit Offsets
//===----------------------------------------------------------------------===//

ds_write_src2_b32 v2 offset0:4 offset1:8
// SICI: ds_write_src2_b32 v2 offset0:4 offset1:8 ; encoding: [0x04,0x08,0x34,0xda,0x02,0x00,0x00,0x00]
// VI:   ds_write_src2_b32 v2 offset0:4 offset1:8 ; encoding: [0x04,0x08,0x1a,0xd9,0x02,0x00,0x00,0x00]

ds_write_src2_b64 v2 offset0:4 offset1:8
// SICI: ds_write_src2_b64 v2 offset0:4 offset1:8 ; encoding: [0x04,0x08,0x34,0xdb,0x02,0x00,0x00,0x00]
// VI:   ds_write_src2_b64 v2 offset0:4 offset1:8 ; encoding: [0x04,0x08,0x9a,0xd9,0x02,0x00,0x00,0x00]

ds_write2_b32 v2, v4, v6 offset0:4
// SICI: ds_write2_b32 v2, v4, v6 offset0:4 ; encoding: [0x04,0x00,0x38,0xd8,0x02,0x04,0x06,0x00]
// VI:   ds_write2_b32 v2, v4, v6 offset0:4 ; encoding: [0x04,0x00,0x1c,0xd8,0x02,0x04,0x06,0x00]

ds_write2_b32 v2, v4, v6 offset0:4 offset1:8
// SICI: ds_write2_b32 v2, v4, v6 offset0:4 offset1:8 ; encoding: [0x04,0x08,0x38,0xd8,0x02,0x04,0x06,0x00]
// VI:   ds_write2_b32 v2, v4, v6 offset0:4 offset1:8 ; encoding: [0x04,0x08,0x1c,0xd8,0x02,0x04,0x06,0x00]

ds_write2_b32 v2, v4, v6 offset1:8
// SICI: ds_write2_b32 v2, v4, v6 offset1:8 ; encoding: [0x00,0x08,0x38,0xd8,0x02,0x04,0x06,0x00]
// VI:   ds_write2_b32 v2, v4, v6 offset1:8 ; encoding: [0x00,0x08,0x1c,0xd8,0x02,0x04,0x06,0x00]

ds_read2_b32 v[8:9], v2 offset0:4
// SICI: ds_read2_b32 v[8:9], v2 offset0:4 ; encoding: [0x04,0x00,0xdc,0xd8,0x02,0x00,0x00,0x08]
// VI:   ds_read2_b32 v[8:9], v2 offset0:4 ; encoding: [0x04,0x00,0x6e,0xd8,0x02,0x00,0x00,0x08]

ds_read2_b32 v[8:9], v2 offset0:4 offset1:8
// SICI: ds_read2_b32 v[8:9], v2 offset0:4 offset1:8 ; encoding: [0x04,0x08,0xdc,0xd8,0x02,0x00,0x00,0x08]
// VI:   ds_read2_b32 v[8:9], v2 offset0:4 offset1:8 ; encoding: [0x04,0x08,0x6e,0xd8,0x02,0x00,0x00,0x08]

ds_read2_b32 v[8:9], v2 offset1:8
// SICI: ds_read2_b32 v[8:9], v2 offset1:8 ; encoding: [0x00,0x08,0xdc,0xd8,0x02,0x00,0x00,0x08]
// VI:   ds_read2_b32 v[8:9], v2 offset1:8 ; encoding: [0x00,0x08,0x6e,0xd8,0x02,0x00,0x00,0x08]

//===----------------------------------------------------------------------===//
// Instructions
//===----------------------------------------------------------------------===//

ds_add_u32 v2, v4
// SICI: ds_add_u32 v2, v4 ; encoding: [0x00,0x00,0x00,0xd8,0x02,0x04,0x00,0x00]
// VI:   ds_add_u32 v2, v4 ; encoding: [0x00,0x00,0x00,0xd8,0x02,0x04,0x00,0x00]

ds_add_f32 v2, v4
// NOSICI: error: instruction not supported on this GPU
// VI:   ds_add_f32 v2, v4 ; encoding: [0x00,0x00,0x2a,0xd8,0x02,0x04,0x00,0x00]

ds_sub_u32 v2, v4
// SICI: ds_sub_u32 v2, v4 ; encoding: [0x00,0x00,0x04,0xd8,0x02,0x04,0x00,0x00]
// VI:   ds_sub_u32 v2, v4 ; encoding: [0x00,0x00,0x02,0xd8,0x02,0x04,0x00,0x00]

ds_rsub_u32 v2, v4
// SICI: ds_rsub_u32 v2, v4 ; encoding: [0x00,0x00,0x08,0xd8,0x02,0x04,0x00,0x00]
// VI:   ds_rsub_u32 v2, v4 ; encoding: [0x00,0x00,0x04,0xd8,0x02,0x04,0x00,0x00]

ds_inc_u32 v2, v4
// SICI: ds_inc_u32 v2, v4 ; encoding: [0x00,0x00,0x0c,0xd8,0x02,0x04,0x00,0x00]
// VI:   ds_inc_u32 v2, v4 ; encoding: [0x00,0x00,0x06,0xd8,0x02,0x04,0x00,0x00]

ds_dec_u32 v2, v4
// SICI: ds_dec_u32 v2, v4 ; encoding: [0x00,0x00,0x10,0xd8,0x02,0x04,0x00,0x00]
// VI:   ds_dec_u32 v2, v4 ; encoding: [0x00,0x00,0x08,0xd8,0x02,0x04,0x00,0x00]

ds_min_i32 v2, v4
// SICI: ds_min_i32 v2, v4 ; encoding: [0x00,0x00,0x14,0xd8,0x02,0x04,0x00,0x00]
// VI:   ds_min_i32 v2, v4 ; encoding: [0x00,0x00,0x0a,0xd8,0x02,0x04,0x00,0x00]

ds_max_i32 v2, v4
// SICI: ds_max_i32 v2, v4 ; encoding: [0x00,0x00,0x18,0xd8,0x02,0x04,0x00,0x00]
// VI:   ds_max_i32 v2, v4 ; encoding: [0x00,0x00,0x0c,0xd8,0x02,0x04,0x00,0x00]

ds_min_u32 v2, v4
// SICI: ds_min_u32 v2, v4 ; encoding: [0x00,0x00,0x1c,0xd8,0x02,0x04,0x00,0x00]
// VI:   ds_min_u32 v2, v4 ; encoding: [0x00,0x00,0x0e,0xd8,0x02,0x04,0x00,0x00]

ds_max_u32 v2, v4
// SICI: ds_max_u32 v2, v4 ; encoding: [0x00,0x00,0x20,0xd8,0x02,0x04,0x00,0x00]
// VI:   ds_max_u32 v2, v4 ; encoding: [0x00,0x00,0x10,0xd8,0x02,0x04,0x00,0x00]

ds_and_b32 v2, v4
// SICI: ds_and_b32 v2, v4 ; encoding: [0x00,0x00,0x24,0xd8,0x02,0x04,0x00,0x00]
// VI:   ds_and_b32 v2, v4 ; encoding: [0x00,0x00,0x12,0xd8,0x02,0x04,0x00,0x00]

ds_or_b32 v2, v4
// SICI: ds_or_b32 v2, v4 ; encoding: [0x00,0x00,0x28,0xd8,0x02,0x04,0x00,0x00]
// VI:   ds_or_b32 v2, v4 ; encoding: [0x00,0x00,0x14,0xd8,0x02,0x04,0x00,0x00]

ds_xor_b32 v2, v4
// SICI: ds_xor_b32 v2, v4 ; encoding: [0x00,0x00,0x2c,0xd8,0x02,0x04,0x00,0x00]
// VI:   ds_xor_b32 v2, v4 ; encoding: [0x00,0x00,0x16,0xd8,0x02,0x04,0x00,0x00]

ds_mskor_b32 v2, v4, v6
// SICI: ds_mskor_b32 v2, v4, v6 ; encoding: [0x00,0x00,0x30,0xd8,0x02,0x04,0x06,0x00]
// VI:   ds_mskor_b32 v2, v4, v6 ; encoding: [0x00,0x00,0x18,0xd8,0x02,0x04,0x06,0x00]

ds_write_b32 v2, v4
// SICI: ds_write_b32 v2, v4 ; encoding: [0x00,0x00,0x34,0xd8,0x02,0x04,0x00,0x00]
// VI:   ds_write_b32 v2, v4 ; encoding: [0x00,0x00,0x1a,0xd8,0x02,0x04,0x00,0x00]

ds_write2_b32 v2, v4, v6
// SICI: ds_write2_b32 v2, v4, v6 ; encoding: [0x00,0x00,0x38,0xd8,0x02,0x04,0x06,0x00]
// VI:   ds_write2_b32 v2, v4, v6 ; encoding: [0x00,0x00,0x1c,0xd8,0x02,0x04,0x06,0x00]

ds_write2st64_b32 v2, v4, v6
// SICI: ds_write2st64_b32 v2, v4, v6 ; encoding: [0x00,0x00,0x3c,0xd8,0x02,0x04,0x06,0x00]
// VI:   ds_write2st64_b32 v2, v4, v6 ; encoding: [0x00,0x00,0x1e,0xd8,0x02,0x04,0x06,0x00]

ds_cmpst_b32 v2, v4, v6
// SICI: ds_cmpst_b32 v2, v4, v6 ; encoding: [0x00,0x00,0x40,0xd8,0x02,0x04,0x06,0x00]
// VI:   ds_cmpst_b32 v2, v4, v6 ; encoding: [0x00,0x00,0x20,0xd8,0x02,0x04,0x06,0x00]

ds_cmpst_f32 v2, v4, v6
// SICI: ds_cmpst_f32 v2, v4, v6 ; encoding: [0x00,0x00,0x44,0xd8,0x02,0x04,0x06,0x00]
// VI:   ds_cmpst_f32 v2, v4, v6 ; encoding: [0x00,0x00,0x22,0xd8,0x02,0x04,0x06,0x00]

ds_min_f32 v2, v4
// SICI: ds_min_f32 v2, v4 ; encoding: [0x00,0x00,0x48,0xd8,0x02,0x04,0x00,0x00]
// VI:   ds_min_f32 v2, v4 ; encoding: [0x00,0x00,0x24,0xd8,0x02,0x04,0x00,0x00]

ds_max_f32 v2, v4
// SICI: ds_max_f32 v2, v4 ; encoding: [0x00,0x00,0x4c,0xd8,0x02,0x04,0x00,0x00]
// VI:   ds_max_f32 v2, v4 ; encoding: [0x00,0x00,0x26,0xd8,0x02,0x04,0x00,0x00]

ds_gws_init v2 gds
// SICI: ds_gws_init v2 gds ; encoding: [0x00,0x00,0x66,0xd8,0x02,0x00,0x00,0x00]
// VI:   ds_gws_init v2 gds ; encoding: [0x00,0x00,0x33,0xd8,0x02,0x00,0x00,0x00]

ds_gws_sema_v v2 gds
// SICI: ds_gws_sema_v v2 gds ; encoding: [0x00,0x00,0x6a,0xd8,0x02,0x00,0x00,0x00]
// VI:   ds_gws_sema_v v2 gds ; encoding: [0x00,0x00,0x35,0xd8,0x02,0x00,0x00,0x00]

ds_gws_sema_br v2 gds
// SICI: ds_gws_sema_br v2 gds ; encoding: [0x00,0x00,0x6e,0xd8,0x02,0x00,0x00,0x00]
// VI:   ds_gws_sema_br v2 gds ; encoding: [0x00,0x00,0x37,0xd8,0x02,0x00,0x00,0x00]

ds_gws_sema_p v2 gds
// SICI: ds_gws_sema_p v2 gds ; encoding: [0x00,0x00,0x72,0xd8,0x02,0x00,0x00,0x00]
// VI:   ds_gws_sema_p v2 gds ; encoding: [0x00,0x00,0x39,0xd8,0x02,0x00,0x00,0x00]

ds_gws_barrier v2 gds
// SICI: ds_gws_barrier v2 gds ; encoding: [0x00,0x00,0x76,0xd8,0x02,0x00,0x00,0x00]
// VI:   ds_gws_barrier v2 gds ; encoding: [0x00,0x00,0x3b,0xd8,0x02,0x00,0x00,0x00]

ds_write_b8 v2, v4
// SICI: ds_write_b8 v2, v4 ; encoding: [0x00,0x00,0x78,0xd8,0x02,0x04,0x00,0x00]
// VI:   ds_write_b8 v2, v4 ; encoding: [0x00,0x00,0x3c,0xd8,0x02,0x04,0x00,0x00]

ds_write_b16 v2, v4
// SICI: ds_write_b16 v2, v4 ; encoding: [0x00,0x00,0x7c,0xd8,0x02,0x04,0x00,0x00]
// VI:   ds_write_b16 v2, v4 ; encoding: [0x00,0x00,0x3e,0xd8,0x02,0x04,0x00,0x00]

ds_add_rtn_u32 v8, v2, v4
// SICI: ds_add_rtn_u32 v8, v2, v4 ; encoding: [0x00,0x00,0x80,0xd8,0x02,0x04,0x00,0x08]
// VI:   ds_add_rtn_u32 v8, v2, v4 ; encoding: [0x00,0x00,0x40,0xd8,0x02,0x04,0x00,0x08]

ds_add_rtn_f32 v8, v2, v4
// NOSICI: error: instruction not supported on this GPU
// VI:   ds_add_rtn_f32 v8, v2, v4 ; encoding: [0x00,0x00,0x6a,0xd8,0x02,0x04,0x00,0x08]

ds_sub_rtn_u32 v8, v2, v4
// SICI: ds_sub_rtn_u32 v8, v2, v4 ; encoding: [0x00,0x00,0x84,0xd8,0x02,0x04,0x00,0x08]
// VI:   ds_sub_rtn_u32 v8, v2, v4 ; encoding: [0x00,0x00,0x42,0xd8,0x02,0x04,0x00,0x08]

ds_rsub_rtn_u32 v8, v2, v4
// SICI: ds_rsub_rtn_u32 v8, v2, v4 ; encoding: [0x00,0x00,0x88,0xd8,0x02,0x04,0x00,0x08]
// VI:   ds_rsub_rtn_u32 v8, v2, v4 ; encoding: [0x00,0x00,0x44,0xd8,0x02,0x04,0x00,0x08]

ds_inc_rtn_u32 v8, v2, v4
// SICI: ds_inc_rtn_u32 v8, v2, v4 ; encoding: [0x00,0x00,0x8c,0xd8,0x02,0x04,0x00,0x08]
// VI:   ds_inc_rtn_u32 v8, v2, v4 ; encoding: [0x00,0x00,0x46,0xd8,0x02,0x04,0x00,0x08]

ds_dec_rtn_u32 v8, v2, v4
// SICI: ds_dec_rtn_u32 v8, v2, v4 ; encoding: [0x00,0x00,0x90,0xd8,0x02,0x04,0x00,0x08]
// VI:   ds_dec_rtn_u32 v8, v2, v4 ; encoding: [0x00,0x00,0x48,0xd8,0x02,0x04,0x00,0x08]

ds_min_rtn_i32 v8, v2, v4
// SICI: ds_min_rtn_i32 v8, v2, v4 ; encoding: [0x00,0x00,0x94,0xd8,0x02,0x04,0x00,0x08]
// VI:   ds_min_rtn_i32 v8, v2, v4 ; encoding: [0x00,0x00,0x4a,0xd8,0x02,0x04,0x00,0x08]

ds_max_rtn_i32 v8, v2, v4
// SICI: ds_max_rtn_i32 v8, v2, v4 ; encoding: [0x00,0x00,0x98,0xd8,0x02,0x04,0x00,0x08]
// VI:   ds_max_rtn_i32 v8, v2, v4 ; encoding: [0x00,0x00,0x4c,0xd8,0x02,0x04,0x00,0x08]

ds_min_rtn_u32 v8, v2, v4
// SICI: ds_min_rtn_u32 v8, v2, v4 ; encoding: [0x00,0x00,0x9c,0xd8,0x02,0x04,0x00,0x08]
// VI:   ds_min_rtn_u32 v8, v2, v4 ; encoding: [0x00,0x00,0x4e,0xd8,0x02,0x04,0x00,0x08]

ds_max_rtn_u32 v8, v2, v4
// SICI: ds_max_rtn_u32 v8, v2, v4 ; encoding: [0x00,0x00,0xa0,0xd8,0x02,0x04,0x00,0x08]
// VI:   ds_max_rtn_u32 v8, v2, v4 ; encoding: [0x00,0x00,0x50,0xd8,0x02,0x04,0x00,0x08]

ds_and_rtn_b32 v8, v2, v4
// SICI: ds_and_rtn_b32 v8, v2, v4 ; encoding: [0x00,0x00,0xa4,0xd8,0x02,0x04,0x00,0x08]
// VI:   ds_and_rtn_b32 v8, v2, v4 ; encoding: [0x00,0x00,0x52,0xd8,0x02,0x04,0x00,0x08]

ds_or_rtn_b32 v8, v2, v4
// SICI: ds_or_rtn_b32 v8, v2, v4 ; encoding: [0x00,0x00,0xa8,0xd8,0x02,0x04,0x00,0x08]
// VI:   ds_or_rtn_b32 v8, v2, v4 ; encoding: [0x00,0x00,0x54,0xd8,0x02,0x04,0x00,0x08]

ds_xor_rtn_b32 v8, v2, v4
// SICI: ds_xor_rtn_b32 v8, v2, v4 ; encoding: [0x00,0x00,0xac,0xd8,0x02,0x04,0x00,0x08]
// VI:   ds_xor_rtn_b32 v8, v2, v4 ; encoding: [0x00,0x00,0x56,0xd8,0x02,0x04,0x00,0x08]

ds_mskor_rtn_b32 v8, v2, v4, v6
// SICI: ds_mskor_rtn_b32 v8, v2, v4, v6 ; encoding: [0x00,0x00,0xb0,0xd8,0x02,0x04,0x06,0x08]
// VI:   ds_mskor_rtn_b32 v8, v2, v4, v6 ; encoding: [0x00,0x00,0x58,0xd8,0x02,0x04,0x06,0x08]

ds_wrxchg_rtn_b32 v8, v2, v4
// SICI: ds_wrxchg_rtn_b32 v8, v2, v4 ; encoding: [0x00,0x00,0xb4,0xd8,0x02,0x04,0x00,0x08]
// VI:   ds_wrxchg_rtn_b32 v8, v2, v4 ; encoding: [0x00,0x00,0x5a,0xd8,0x02,0x04,0x00,0x08]

ds_wrxchg2_rtn_b32 v[8:9], v2, v4, v6
// SICI: ds_wrxchg2_rtn_b32 v[8:9], v2, v4, v6 ; encoding: [0x00,0x00,0xb8,0xd8,0x02,0x04,0x06,0x08]
// VI:   ds_wrxchg2_rtn_b32 v[8:9], v2, v4, v6 ; encoding: [0x00,0x00,0x5c,0xd8,0x02,0x04,0x06,0x08]

ds_wrxchg2st64_rtn_b32 v[8:9] v2, v4, v6
// SICI: ds_wrxchg2st64_rtn_b32 v[8:9], v2, v4, v6 ; encoding: [0x00,0x00,0xbc,0xd8,0x02,0x04,0x06,0x08]
// VI:   ds_wrxchg2st64_rtn_b32 v[8:9], v2, v4, v6 ; encoding: [0x00,0x00,0x5e,0xd8,0x02,0x04,0x06,0x08]

ds_cmpst_rtn_b32 v8, v2, v4, v6
// SICI: ds_cmpst_rtn_b32 v8, v2, v4, v6 ; encoding: [0x00,0x00,0xc0,0xd8,0x02,0x04,0x06,0x08]
// VI:   ds_cmpst_rtn_b32 v8, v2, v4, v6 ; encoding: [0x00,0x00,0x60,0xd8,0x02,0x04,0x06,0x08]

ds_cmpst_rtn_f32 v8, v2, v4, v6
// SICI: ds_cmpst_rtn_f32 v8, v2, v4, v6 ; encoding: [0x00,0x00,0xc4,0xd8,0x02,0x04,0x06,0x08]
// VI:   ds_cmpst_rtn_f32 v8, v2, v4, v6 ; encoding: [0x00,0x00,0x62,0xd8,0x02,0x04,0x06,0x08]

ds_min_rtn_f32 v8, v2, v4
// SICI: ds_min_rtn_f32 v8, v2, v4 ; encoding: [0x00,0x00,0xc8,0xd8,0x02,0x04,0x00,0x08]
// VI:   ds_min_rtn_f32 v8, v2, v4 ; encoding: [0x00,0x00,0x64,0xd8,0x02,0x04,0x00,0x08]

ds_max_rtn_f32 v8, v2, v4
// SICI: ds_max_rtn_f32 v8, v2, v4 ; encoding: [0x00,0x00,0xcc,0xd8,0x02,0x04,0x00,0x08]
// VI:   ds_max_rtn_f32 v8, v2, v4 ; encoding: [0x00,0x00,0x66,0xd8,0x02,0x04,0x00,0x08]

ds_swizzle_b32 v8, v2
// SICI: ds_swizzle_b32 v8, v2 ; encoding: [0x00,0x00,0xd4,0xd8,0x02,0x00,0x00,0x08]
// VI:   ds_swizzle_b32 v8, v2 ; encoding: [0x00,0x00,0x7a,0xd8,0x02,0x00,0x00,0x08]

ds_read_b32 v8, v2
// SICI: ds_read_b32 v8, v2 ; encoding: [0x00,0x00,0xd8,0xd8,0x02,0x00,0x00,0x08]
// VI:   ds_read_b32 v8, v2 ; encoding: [0x00,0x00,0x6c,0xd8,0x02,0x00,0x00,0x08]

ds_read2_b32 v[8:9], v2
// SICI: ds_read2_b32 v[8:9], v2 ; encoding: [0x00,0x00,0xdc,0xd8,0x02,0x00,0x00,0x08]
// VI:   ds_read2_b32 v[8:9], v2 ; encoding: [0x00,0x00,0x6e,0xd8,0x02,0x00,0x00,0x08]

ds_read2st64_b32 v[8:9], v2
// SICI: ds_read2st64_b32 v[8:9], v2 ; encoding: [0x00,0x00,0xe0,0xd8,0x02,0x00,0x00,0x08]
// VI:   ds_read2st64_b32 v[8:9], v2 ; encoding: [0x00,0x00,0x70,0xd8,0x02,0x00,0x00,0x08]

ds_read_i8 v8, v2
// SICI: ds_read_i8 v8, v2 ; encoding: [0x00,0x00,0xe4,0xd8,0x02,0x00,0x00,0x08]
// VI:   ds_read_i8 v8, v2 ; encoding: [0x00,0x00,0x72,0xd8,0x02,0x00,0x00,0x08]

ds_read_u8 v8, v2
// SICI: ds_read_u8 v8, v2 ; encoding: [0x00,0x00,0xe8,0xd8,0x02,0x00,0x00,0x08]
// VI:   ds_read_u8 v8, v2 ; encoding: [0x00,0x00,0x74,0xd8,0x02,0x00,0x00,0x08]

ds_read_i16 v8, v2
// SICI: ds_read_i16 v8, v2 ; encoding: [0x00,0x00,0xec,0xd8,0x02,0x00,0x00,0x08]
// VI:   ds_read_i16 v8, v2 ; encoding: [0x00,0x00,0x76,0xd8,0x02,0x00,0x00,0x08]

ds_read_u16 v8, v2
// SICI: ds_read_u16 v8, v2 ; encoding: [0x00,0x00,0xf0,0xd8,0x02,0x00,0x00,0x08]
// VI:   ds_read_u16 v8, v2 ; encoding: [0x00,0x00,0x78,0xd8,0x02,0x00,0x00,0x08]


//ds_consume v8
// FIXMESICI: ds_consume v8 ; encoding: [0x00,0x00,0xf4,0xd8,0x00,0x00,0x00,0x08]
// FIXMEVI:   ds_consume v8 ; encoding: [0x00,0x00,0x7a,0xd8,0x00,0x00,0x00,0x08]

//ds_append v8
// FIXMESICI: ds_append v8 ; encoding: [0x00,0x00,0xf8,0xd8,0x00,0x00,0x00,0x08]
// FIXMEVI:   ds_append v8 ; encoding: [0x00,0x00,0x7c,0xd8,0x00,0x00,0x00,0x08]

//ds_ordered_count v8, v2 gds
// FIXMESICI: ds_ordered_count v8, v2 gds ; encoding: [0x00,0x00,0xfe,0xd8,0x02,0x00,0x00,0x08]
// FIXMEVI:   ds_ordered_count v8, v2 gds ; encoding: [0x00,0x00,0x7f,0xd8,0x02,0x00,0x00,0x08]

ds_add_u64 v2, v[4:5]
// SICI: ds_add_u64 v2, v[4:5] ; encoding: [0x00,0x00,0x00,0xd9,0x02,0x04,0x00,0x00]
// VI:   ds_add_u64 v2, v[4:5] ; encoding: [0x00,0x00,0x80,0xd8,0x02,0x04,0x00,0x00]

ds_sub_u64 v2, v[4:5]
// SICI: ds_sub_u64 v2, v[4:5] ; encoding: [0x00,0x00,0x04,0xd9,0x02,0x04,0x00,0x00]
// VI:   ds_sub_u64 v2, v[4:5] ; encoding: [0x00,0x00,0x82,0xd8,0x02,0x04,0x00,0x00]

ds_rsub_u64 v2, v[4:5]
// SICI: ds_rsub_u64 v2, v[4:5] ; encoding: [0x00,0x00,0x08,0xd9,0x02,0x04,0x00,0x00]
// VI:   ds_rsub_u64 v2, v[4:5] ; encoding: [0x00,0x00,0x84,0xd8,0x02,0x04,0x00,0x00]

ds_inc_u64 v2, v[4:5]
// SICI: ds_inc_u64 v2, v[4:5] ; encoding: [0x00,0x00,0x0c,0xd9,0x02,0x04,0x00,0x00]
// VI:   ds_inc_u64 v2, v[4:5] ; encoding: [0x00,0x00,0x86,0xd8,0x02,0x04,0x00,0x00]

ds_dec_u64 v2, v[4:5]
// SICI: ds_dec_u64 v2, v[4:5] ; encoding: [0x00,0x00,0x10,0xd9,0x02,0x04,0x00,0x00]
// VI:   ds_dec_u64 v2, v[4:5] ; encoding: [0x00,0x00,0x88,0xd8,0x02,0x04,0x00,0x00]

ds_min_i64 v2, v[4:5]
// SICI: ds_min_i64 v2, v[4:5] ; encoding: [0x00,0x00,0x14,0xd9,0x02,0x04,0x00,0x00]
// VI:   ds_min_i64 v2, v[4:5] ; encoding: [0x00,0x00,0x8a,0xd8,0x02,0x04,0x00,0x00]

ds_max_i64 v2, v[4:5]
// SICI: ds_max_i64 v2, v[4:5] ; encoding: [0x00,0x00,0x18,0xd9,0x02,0x04,0x00,0x00]
// VI:   ds_max_i64 v2, v[4:5] ; encoding: [0x00,0x00,0x8c,0xd8,0x02,0x04,0x00,0x00]

ds_min_u64 v2, v[4:5]
// SICI: ds_min_u64 v2, v[4:5] ; encoding: [0x00,0x00,0x1c,0xd9,0x02,0x04,0x00,0x00]
// VI:   ds_min_u64 v2, v[4:5] ; encoding: [0x00,0x00,0x8e,0xd8,0x02,0x04,0x00,0x00]

ds_max_u64 v2, v[4:5]
// SICI: ds_max_u64 v2, v[4:5] ; encoding: [0x00,0x00,0x20,0xd9,0x02,0x04,0x00,0x00]
// VI:   ds_max_u64 v2, v[4:5] ; encoding: [0x00,0x00,0x90,0xd8,0x02,0x04,0x00,0x00]

ds_and_b64 v2, v[4:5]
// SICI: ds_and_b64 v2, v[4:5] ; encoding: [0x00,0x00,0x24,0xd9,0x02,0x04,0x00,0x00]
// VI:   ds_and_b64 v2, v[4:5] ; encoding: [0x00,0x00,0x92,0xd8,0x02,0x04,0x00,0x00]

ds_or_b64 v2, v[4:5]
// SICI: ds_or_b64 v2, v[4:5] ; encoding: [0x00,0x00,0x28,0xd9,0x02,0x04,0x00,0x00]
// VI:   ds_or_b64 v2, v[4:5] ; encoding: [0x00,0x00,0x94,0xd8,0x02,0x04,0x00,0x00]

ds_xor_b64 v2, v[4:5]
// SICI: ds_xor_b64 v2, v[4:5] ; encoding: [0x00,0x00,0x2c,0xd9,0x02,0x04,0x00,0x00]
// VI:   ds_xor_b64 v2, v[4:5] ; encoding: [0x00,0x00,0x96,0xd8,0x02,0x04,0x00,0x00]

ds_mskor_b64 v2, v[4:5], v[6:7]
// SICI: ds_mskor_b64 v2, v[4:5], v[6:7] ; encoding: [0x00,0x00,0x30,0xd9,0x02,0x04,0x06,0x00]
// VI:   ds_mskor_b64 v2, v[4:5], v[6:7] ; encoding: [0x00,0x00,0x98,0xd8,0x02,0x04,0x06,0x00]

ds_write_b64 v2, v[4:5]
// SICI: ds_write_b64 v2, v[4:5] ; encoding: [0x00,0x00,0x34,0xd9,0x02,0x04,0x00,0x00]
// VI:   ds_write_b64 v2, v[4:5] ; encoding: [0x00,0x00,0x9a,0xd8,0x02,0x04,0x00,0x00]

ds_write2_b64 v2, v[4:5], v[6:7]
// SICI: ds_write2_b64 v2, v[4:5], v[6:7] ; encoding: [0x00,0x00,0x38,0xd9,0x02,0x04,0x06,0x00]
// VI:   ds_write2_b64 v2, v[4:5], v[6:7] ; encoding: [0x00,0x00,0x9c,0xd8,0x02,0x04,0x06,0x00]

ds_write2st64_b64 v2, v[4:5], v[6:7]
// SICI: ds_write2st64_b64 v2, v[4:5], v[6:7] ; encoding: [0x00,0x00,0x3c,0xd9,0x02,0x04,0x06,0x00]
// VI:   ds_write2st64_b64 v2, v[4:5], v[6:7] ; encoding: [0x00,0x00,0x9e,0xd8,0x02,0x04,0x06,0x00]

ds_cmpst_b64 v2, v[4:5], v[6:7]
// SICI: ds_cmpst_b64 v2, v[4:5], v[6:7] ; encoding: [0x00,0x00,0x40,0xd9,0x02,0x04,0x06,0x00]
// VI:   ds_cmpst_b64 v2, v[4:5], v[6:7] ; encoding: [0x00,0x00,0xa0,0xd8,0x02,0x04,0x06,0x00]

ds_cmpst_f64 v2, v[4:5], v[6:7]
// SICI: ds_cmpst_f64 v2, v[4:5], v[6:7] ; encoding: [0x00,0x00,0x44,0xd9,0x02,0x04,0x06,0x00]
// VI:   ds_cmpst_f64 v2, v[4:5], v[6:7] ; encoding: [0x00,0x00,0xa2,0xd8,0x02,0x04,0x06,0x00]

ds_min_f64 v2, v[4:5]
// SICI: ds_min_f64 v2, v[4:5] ; encoding: [0x00,0x00,0x48,0xd9,0x02,0x04,0x00,0x00]
// VI:   ds_min_f64 v2, v[4:5] ; encoding: [0x00,0x00,0xa4,0xd8,0x02,0x04,0x00,0x00]

ds_max_f64 v2, v[4:5]
// SICI: ds_max_f64 v2, v[4:5] ; encoding: [0x00,0x00,0x4c,0xd9,0x02,0x04,0x00,0x00]
// VI:   ds_max_f64 v2, v[4:5] ; encoding: [0x00,0x00,0xa6,0xd8,0x02,0x04,0x00,0x00]

ds_add_rtn_u64 v[8:9], v2, v[4:5]
// SICI: ds_add_rtn_u64 v[8:9], v2, v[4:5] ; encoding: [0x00,0x00,0x80,0xd9,0x02,0x04,0x00,0x08]
// VI:   ds_add_rtn_u64 v[8:9], v2, v[4:5] ; encoding: [0x00,0x00,0xc0,0xd8,0x02,0x04,0x00,0x08]

ds_sub_rtn_u64 v[8:9], v2, v[4:5]
// SICI: ds_sub_rtn_u64 v[8:9], v2, v[4:5] ; encoding: [0x00,0x00,0x84,0xd9,0x02,0x04,0x00,0x08]
// VI:   ds_sub_rtn_u64 v[8:9], v2, v[4:5] ; encoding: [0x00,0x00,0xc2,0xd8,0x02,0x04,0x00,0x08]

ds_rsub_rtn_u64 v[8:9], v2, v[4:5]
// SICI: ds_rsub_rtn_u64 v[8:9], v2, v[4:5] ; encoding: [0x00,0x00,0x88,0xd9,0x02,0x04,0x00,0x08]
// VI:   ds_rsub_rtn_u64 v[8:9], v2, v[4:5] ; encoding: [0x00,0x00,0xc4,0xd8,0x02,0x04,0x00,0x08]

ds_inc_rtn_u64 v[8:9], v2, v[4:5]
// SICI: ds_inc_rtn_u64 v[8:9], v2, v[4:5] ; encoding: [0x00,0x00,0x8c,0xd9,0x02,0x04,0x00,0x08]
// VI:   ds_inc_rtn_u64 v[8:9], v2, v[4:5] ; encoding: [0x00,0x00,0xc6,0xd8,0x02,0x04,0x00,0x08]

ds_dec_rtn_u64 v[8:9] v2, v[4:5]
// SICI: ds_dec_rtn_u64 v[8:9], v2, v[4:5] ; encoding: [0x00,0x00,0x90,0xd9,0x02,0x04,0x00,0x08]
// VI:   ds_dec_rtn_u64 v[8:9], v2, v[4:5] ; encoding: [0x00,0x00,0xc8,0xd8,0x02,0x04,0x00,0x08]

ds_min_rtn_i64 v[8:9], v2, v[4:5]
// SICI: ds_min_rtn_i64 v[8:9], v2, v[4:5] ; encoding: [0x00,0x00,0x94,0xd9,0x02,0x04,0x00,0x08]
// VI:   ds_min_rtn_i64 v[8:9], v2, v[4:5] ; encoding: [0x00,0x00,0xca,0xd8,0x02,0x04,0x00,0x08]

ds_max_rtn_i64 v[8:9], v2, v[4:5]
// SICI: ds_max_rtn_i64 v[8:9], v2, v[4:5] ; encoding: [0x00,0x00,0x98,0xd9,0x02,0x04,0x00,0x08]
// VI:   ds_max_rtn_i64 v[8:9], v2, v[4:5] ; encoding: [0x00,0x00,0xcc,0xd8,0x02,0x04,0x00,0x08]

ds_min_rtn_u64 v[8:9], v2, v[4:5]
// SICI: ds_min_rtn_u64 v[8:9], v2, v[4:5] ; encoding: [0x00,0x00,0x9c,0xd9,0x02,0x04,0x00,0x08]
// VI:   ds_min_rtn_u64 v[8:9], v2, v[4:5] ; encoding: [0x00,0x00,0xce,0xd8,0x02,0x04,0x00,0x08]

ds_max_rtn_u64 v[8:9], v2, v[4:5]
// SICI: ds_max_rtn_u64 v[8:9], v2, v[4:5] ; encoding: [0x00,0x00,0xa0,0xd9,0x02,0x04,0x00,0x08]
// VI:   ds_max_rtn_u64 v[8:9], v2, v[4:5] ; encoding: [0x00,0x00,0xd0,0xd8,0x02,0x04,0x00,0x08]

ds_and_rtn_b64 v[8:9], v2, v[4:5]
// SICI: ds_and_rtn_b64 v[8:9], v2, v[4:5] ; encoding: [0x00,0x00,0xa4,0xd9,0x02,0x04,0x00,0x08]
// VI:   ds_and_rtn_b64 v[8:9], v2, v[4:5] ; encoding: [0x00,0x00,0xd2,0xd8,0x02,0x04,0x00,0x08]

ds_or_rtn_b64 v[8:9], v2, v[4:5]
// SICI: ds_or_rtn_b64 v[8:9], v2, v[4:5] ; encoding: [0x00,0x00,0xa8,0xd9,0x02,0x04,0x00,0x08]
// VI:   ds_or_rtn_b64 v[8:9], v2, v[4:5] ; encoding: [0x00,0x00,0xd4,0xd8,0x02,0x04,0x00,0x08]

ds_xor_rtn_b64 v[8:9], v2, v[4:5]
// SICI: ds_xor_rtn_b64 v[8:9], v2, v[4:5] ; encoding: [0x00,0x00,0xac,0xd9,0x02,0x04,0x00,0x08]
// VI:   ds_xor_rtn_b64 v[8:9], v2, v[4:5] ; encoding: [0x00,0x00,0xd6,0xd8,0x02,0x04,0x00,0x08]

ds_mskor_rtn_b64 v[8:9], v2, v[4:5], v[6:7]
// SICI: ds_mskor_rtn_b64 v[8:9], v2, v[4:5], v[6:7] ; encoding: [0x00,0x00,0xb0,0xd9,0x02,0x04,0x06,0x08]
// VI:   ds_mskor_rtn_b64 v[8:9], v2, v[4:5], v[6:7] ; encoding: [0x00,0x00,0xd8,0xd8,0x02,0x04,0x06,0x08]

ds_wrxchg_rtn_b64 v[8:9], v2, v[4:5]
// SICI: ds_wrxchg_rtn_b64 v[8:9], v2, v[4:5] ; encoding: [0x00,0x00,0xb4,0xd9,0x02,0x04,0x00,0x08]
// VI:   ds_wrxchg_rtn_b64 v[8:9], v2, v[4:5] ; encoding: [0x00,0x00,0xda,0xd8,0x02,0x04,0x00,0x08]

ds_wrxchg2_rtn_b64 v[8:11], v2, v[4:5], v[6:7]
// SICI: ds_wrxchg2_rtn_b64 v[8:11], v2, v[4:5], v[6:7] ; encoding: [0x00,0x00,0xb8,0xd9,0x02,0x04,0x06,0x08]
// VI:   ds_wrxchg2_rtn_b64 v[8:11], v2, v[4:5], v[6:7] ; encoding: [0x00,0x00,0xdc,0xd8,0x02,0x04,0x06,0x08]

ds_wrxchg2st64_rtn_b64 v[8:11], v2, v[4:5], v[6:7]
// SICI: ds_wrxchg2st64_rtn_b64 v[8:11], v2, v[4:5], v[6:7] ; encoding: [0x00,0x00,0xbc,0xd9,0x02,0x04,0x06,0x08]
// VI:   ds_wrxchg2st64_rtn_b64 v[8:11], v2, v[4:5], v[6:7] ; encoding: [0x00,0x00,0xde,0xd8,0x02,0x04,0x06,0x08]

ds_cmpst_rtn_b64 v[8:9], v2, v[4:5], v[6:7]
// SICI: ds_cmpst_rtn_b64 v[8:9], v2, v[4:5], v[6:7] ; encoding: [0x00,0x00,0xc0,0xd9,0x02,0x04,0x06,0x08]
// VI:   ds_cmpst_rtn_b64 v[8:9], v2, v[4:5], v[6:7] ; encoding: [0x00,0x00,0xe0,0xd8,0x02,0x04,0x06,0x08]

ds_cmpst_rtn_f64 v[8:9], v2, v[4:5], v[6:7]
// SICI: ds_cmpst_rtn_f64 v[8:9], v2, v[4:5], v[6:7] ; encoding: [0x00,0x00,0xc4,0xd9,0x02,0x04,0x06,0x08]
// VI:   ds_cmpst_rtn_f64 v[8:9], v2, v[4:5], v[6:7] ; encoding: [0x00,0x00,0xe2,0xd8,0x02,0x04,0x06,0x08]

ds_min_rtn_f64 v[8:9], v2, v[4:5]
// SICI: ds_min_rtn_f64 v[8:9], v2, v[4:5] ; encoding: [0x00,0x00,0xc8,0xd9,0x02,0x04,0x00,0x08]
// VI:   ds_min_rtn_f64 v[8:9], v2, v[4:5] ; encoding: [0x00,0x00,0xe4,0xd8,0x02,0x04,0x00,0x08]

ds_max_rtn_f64 v[8:9], v2, v[4:5]
// SICI: ds_max_rtn_f64 v[8:9], v2, v[4:5] ; encoding: [0x00,0x00,0xcc,0xd9,0x02,0x04,0x00,0x08]
// VI:   ds_max_rtn_f64 v[8:9], v2, v[4:5] ; encoding: [0x00,0x00,0xe6,0xd8,0x02,0x04,0x00,0x08]

ds_read_b64 v[8:9], v2
// SICI: ds_read_b64 v[8:9], v2 ; encoding: [0x00,0x00,0xd8,0xd9,0x02,0x00,0x00,0x08]
// VI:   ds_read_b64 v[8:9], v2 ; encoding: [0x00,0x00,0xec,0xd8,0x02,0x00,0x00,0x08]

ds_read2_b64 v[8:11], v2
// SICI: ds_read2_b64 v[8:11], v2 ; encoding: [0x00,0x00,0xdc,0xd9,0x02,0x00,0x00,0x08]
// VI:   ds_read2_b64 v[8:11], v2 ; encoding: [0x00,0x00,0xee,0xd8,0x02,0x00,0x00,0x08]

ds_read2st64_b64 v[8:11], v2
// SICI: ds_read2st64_b64 v[8:11], v2 ; encoding: [0x00,0x00,0xe0,0xd9,0x02,0x00,0x00,0x08]
// VI:   ds_read2st64_b64 v[8:11], v2 ; encoding: [0x00,0x00,0xf0,0xd8,0x02,0x00,0x00,0x08]

ds_read_b128 v[8:11], v2
// NOSI: error: instruction not supported on this GPU
// CI:   ds_read_b128 v[8:11], v2 ; encoding: [0x00,0x00,0xfc,0xdb,0x02,0x00,0x00,0x08]
// VI:   ds_read_b128 v[8:11], v2 ; encoding: [0x00,0x00,0xfe,0xd9,0x02,0x00,0x00,0x08]

ds_write_b128 v2, v[4:7]
// NOSI: error: instruction not supported on this GPU
// CI: ds_write_b128 v2, v[4:7] ; encoding: [0x00,0x00,0x7c,0xdb,0x02,0x04,0x00,0x00]
// VI:   ds_write_b128 v2, v[4:7] ; encoding: [0x00,0x00,0xbe,0xd9,0x02,0x04,0x00,0x00]

ds_nop
// NOSI: error: instruction not supported on this GPU
// CI: ds_nop ; encoding: [0x00,0x00,0x50,0xd8,0x00,0x00,0x00,0x00]
// VI: ds_nop ; encoding: [0x00,0x00,0x28,0xd8,0x00,0x00,0x00,0x00]