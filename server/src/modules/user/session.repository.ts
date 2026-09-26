import Session, { type ISession } from "@/modules/user/session.model";

export const create = async (data: Partial<ISession>) => {
  return await Session.create(data);
};

export const findByKey = async (key: string) => {
  return await Session.findOne({ key });
};

export const deleteByKey = async (key: string) => {
  return await Session.deleteOne({ key });
};

/** Insert or replace, for deterministic keys such as `signup:<email>`. */
export const upsert = async (key: string, value: string, expiresAt: Date) => {
  return await Session.findOneAndUpdate(
    { key },
    { value, expiresAt },
    { upsert: true, new: true },
  );
};

/** Atomically read and remove, so a stored token can only be claimed once. */
export const consume = async (key: string) => {
  return await Session.findOneAndDelete({ key });
};

export const consumeUnexpired = async (key: string) => {
  return await Session.findOneAndDelete({
    key,
    expiresAt: { $gt: new Date() },
  });
};

/** Swap a stored token only while it still matches, blocking replay. */
export const rotate = async (
  key: string,
  currentValue: string,
  nextValue: string,
  expiresAt: Date,
) => {
  return await Session.findOneAndUpdate(
    { key, value: currentValue, expiresAt: { $gt: new Date() } },
    { value: nextValue, expiresAt },
    { new: true },
  );
};
