import { db } from "@/server/db";
import { licenseBatches, licenseKeys } from "@/server/db/schema/schema";
import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";

// 生成随机卡密
function generateLicenseKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let key = "";
  for (let i = 0; i < 16; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

// 创建卡密批次
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, type, count, duration, notes } = body;

    const batchId = nanoid();
    const batch = await db.insert(licenseBatches).values({
      id: batchId,
      name,
      type,
      count,
      duration,
      createdBy: "admin", // TODO: 从会话中获取管理员ID
      notes,
    });

    // 生成卡密
    const licenseKeysToInsert = Array.from({ length: count }, () => ({
      id: nanoid(),
      key: generateLicenseKey(),
      type,
      batchId,
      notes,
    }));

    await db.insert(licenseKeys).values(licenseKeysToInsert);

    return NextResponse.json({ success: true, batchId });
  } catch (error) {
    console.error("创建卡密批次失败:", error);
    return NextResponse.json({ error: "创建卡密批次失败" }, 500);
  }
}

// 获取卡密列表
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const batchId = searchParams.get("batchId");

    let query = db.select().from(licenseKeys);

    if (status) {
      query = query.where(eq(licenseKeys.status, status));
    }
    if (type) {
      query = query.where(eq(licenseKeys.type, type));
    }
    if (batchId) {
      query = query.where(eq(licenseKeys.batchId, batchId));
    }

    const licenses = await query;

    return NextResponse.json({ licenses });
  } catch (error) {
    console.error("获取卡密列表失败:", error);
    return NextResponse.json({ error: "获取卡密列表失败" }, 500);
  }
}

// 验证卡密
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { key, clientId } = body;

    const license = await db.query.licenseKeys.findFirst({
      where: and(eq(licenseKeys.key, key), eq(licenseKeys.status, "unused")),
    });

    if (!license) {
      return NextResponse.json({ error: "无效的卡密" }, 400);
    }

    // 计算过期时间
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(now.getDate() + 30); // 默认30天，实际应该根据卡密类型设置

    // 更新卡密状态
    await db
      .update(licenseKeys)
      .set({
        status: "used",
        usedAt: now,
        expiresAt,
        usedBy: clientId,
      })
      .where(eq(licenseKeys.id, license.id));

    return NextResponse.json({
      success: true,
      expiresAt,
      type: license.type,
    });
  } catch (error) {
    console.error("验证卡密失败:", error);
    return NextResponse.json({ error: "验证卡密失败" }, 500);
  }
}
