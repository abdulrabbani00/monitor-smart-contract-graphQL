import { Entity, BaseEntity, PrimaryGeneratedColumn, Column } from "typeorm";
import { ObjectType, Field, ID } from "type-graphql";

@Entity()
@ObjectType()
export class Transfer extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  transactionHash: string;

  @Field(() => String)
  @Column()
  blockNumber: number;

  @Field(() => String)
  @Column()
  fromAddress: string;

  @Field(() => String)
  @Column()
  toAddress: string;

  @Field(() => Number)
  @Column()
  tokenId: number;

  @Field(() => Boolean)
  @Column()
  @Column({ default: false })
  isRead: boolean;
}